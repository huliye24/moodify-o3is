package basicpitch

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

// PitchResult 音高检测结果
type PitchResult struct {
	Pitches []Note `json:"pitches"`
}

// Note 单个音符
type Note struct {
	StartTime float64 `json:"start_time"`
	EndTime   float64 `json:"end_time"`
	Pitch     float64 `json:"pitch"` // MIDI 音高
	Frequency float64 `json:"frequency"`
	NoteName  string  `json:"note_name"` // e.g., "C4", "A#3"
	Confidence float64 `json:"confidence"`
}

// MelodyResult 旋律结果
type MelodyResult struct {
	Midi     []float64 `json:"midi"`
	Hz       []float64 `json:"hz"`
	Times    []float64 `json:"times"`
	Confidence []float64 `json:"confidence"`
}

// BasicPitch BasicPitch 集成
type BasicPitch struct {
	pythonPath string
	modelPath string
}

// NewBasicPitch 创建 BasicPitch 实例
func NewBasicPitch(pythonPath string) *BasicPitch {
	return &BasicPitch{
		pythonPath: pythonPath,
	}
}

// SetModelPath 设置模型路径
func (bp *BasicPitch) SetModelPath(modelPath string) {
	bp.modelPath = modelPath
}

// DetectPitch 检测音高（完整分析）
func (bp *BasicPitch) DetectPitch(audioPath string) (*PitchResult, error) {
	// 使用 basic_pitch 命令行工具
	args := []string{
		"-m", bp.modelPath,
		"--json-output",
		audioPath,
	}

	output, err := bp.runPythonScript(args)
	if err != nil {
		return nil, fmt.Errorf("basic_pitch 检测失败: %v\n输出: %s", err, string(output))
	}

	// 解析 JSON 输出
	var result PitchResult
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("解析输出失败: %v", err)
	}

	return &result, nil
}

// ExtractMelody 提取旋律线
func (bp *BasicPitch) ExtractMelody(audioPath string) (*MelodyResult, error) {
	// Python 脚本
	script := `
import sys
import json
try:
    from basic_pitch.inference import BasicPitch
    from basic_pitch import predict
    import numpy as np
    
    bp = BasicPitch()
    model_output = bp.predict_audio_file(sys.argv[1])
    
    # 提取旋律
    melody = model_output['midi_pitch']
    times = model_output['timestamps']
    
    result = {
        'midi': melody.tolist() if hasattr(melody, 'tolist') else list(melody),
        'times': times.tolist() if hasattr(times, 'tolist') else list(times),
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e)}), file=sys.stderr)
    sys.exit(1)
`
	
	output, err := bp.runInlinePython(script, audioPath)
	if err != nil {
		return nil, fmt.Errorf("旋律提取失败: %v", err)
	}

	var result MelodyResult
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("解析旋律结果失败: %v", err)
	}

	return &result, nil
}

// GeneratePrompt 根据检测结果生成 Suno Prompt
func (bp *BasicPitch) GeneratePrompt(result *PitchResult) string {
	if len(result.Pitches) == 0 {
		return ""
	}

	// 分析音高范围
	var minPitch, maxPitch float64 = 127, 0
	var avgPitch float64
	var confidenceSum float64

	for _, note := range result.Pitches {
		if note.Confidence > 0.5 {
			if note.Pitch < minPitch {
				minPitch = note.Pitch
			}
			if note.Pitch > maxPitch {
				maxPitch = note.Pitch
			}
			avgPitch += note.Pitch
			confidenceSum++
		}
	}

	if confidenceSum == 0 {
		return "ambient music"
	}

	avgPitch /= confidenceSum

	// 估算调性
	rootNote := int(minPitch) % 12
	keyNames := []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}
	key := keyNames[rootNote]

	// 估算音域
	octaveRange := int(maxPitch - minPitch)
	var rangeDesc string
	switch {
	case octaveRange < 12:
		rangeDesc = "narrow range"
	case octaveRange < 24:
		rangeDesc = "moderate range"
	default:
		rangeDesc = "wide range"
	}

	// 估算速度
	tempoEstimate := 120 // 默认
	if len(result.Pitches) > 1 {
		totalDuration := result.Pitches[len(result.Pitches)-1].EndTime - result.Pitches[0].StartTime
		if totalDuration > 0 {
			tempoEstimate = int(float64(len(result.Pitches)) / totalDuration * 60)
		}
	}

	var tempoDesc string
	switch {
	case tempoEstimate < 80:
		tempoDesc = "slow, ballad"
	case tempoEstimate < 100:
		tempoDesc = "moderate"
	case tempoEstimate < 120:
		tempoDesc = "upbeat"
	default:
		tempoDesc = "fast tempo"
	}

	return fmt.Sprintf("%s %s, %s, %s, ~%d BPM", key, rangeDesc, tempoDesc, rangeDesc, tempoEstimate)
}

// ConvertMidiToNoteName 将 MIDI 音高转换为音符名
func ConvertMidiToNoteName(midi int) string {
	noteNames := []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}
	octave := (midi / 12) - 1
	note := noteNames[midi%12]
	return fmt.Sprintf("%s%d", note, octave)
}

// runPythonScript 运行 Python 脚本
func (bp *BasicPitch) runPythonScript(args []string) ([]byte, error) {
	cmd := exec.Command(bp.pythonPath, args...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return stderr.Bytes(), err
	}

	return stdout.Bytes(), nil
}

// runInlinePython 运行内联 Python 脚本
func (bp *BasicPitch) runInlinePython(script string, args ...string) ([]byte, error) {
	// 创建临时脚本
	scriptPath := filepath.Join("/tmp", "basicpitch_temp.py")
	if err := exec.Command("sh", "-c", fmt.Sprintf("cat > %s << 'SCRIPT'\n%s\nSCRIPT", scriptPath, script)).Run(); err != nil {
		return nil, err
	}

	// 构建命令
	cmdArgs := append([]string{scriptPath}, args...)
	cmd := exec.Command(bp.pythonPath, cmdArgs...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return stderr.Bytes(), err
	}

	return stdout.Bytes(), nil
}

// IsAvailable 检查 BasicPitch 是否可用
func (bp *BasicPitch) IsAvailable() bool {
	cmd := exec.Command(bp.pythonPath, "-c", "import basic_pitch; print('ok')")
	output, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(output), "ok")
}

// GetVersion 获取 BasicPitch 版本
func (bp *BasicPitch) GetVersion() string {
	cmd := exec.Command(bp.pythonPath, "-c", "import basic_pitch; print(basic_pitch.__version__)")
	output, err := cmd.Output()
	if err != nil {
		return "unknown"
	}
	return strings.TrimSpace(string(output))
}
