package scanner

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// AudioExtensions 支持的音频文件扩展名
var AudioExtensions = map[string]bool{
	".mp3":  true,
	".flac":  true,
	".wav":   true,
	".ogg":   true,
	".m4a":   true,
	".aac":   true,
	".opus":  true,
	".wma":   true,
	".ape":   true,
	".alac":  true,
}

// ScanResult 扫描结果
type ScanResult struct {
	Path     string `json:"path"`
	Name     string `json:"name"`
	Ext      string `json:"ext"`
	Size     int64  `json:"size"`
	Hash     string `json:"hash"`
	Relative string `json:"relative"`
}

// ScanDirResult 目录扫描结果
type ScanDirResult struct {
	Root   string       `json:"root"`
	Total  int          `json:"total"`
	Files  []ScanResult `json:"files"`
	Errors []string     `json:"errors,omitempty"`
}

// Scanner 音频文件扫描器
type Scanner struct {
	RootDir string
	mu      sync.Mutex
}

// NewScanner 创建扫描器
func NewScanner(rootDir string) *Scanner {
	return &Scanner{RootDir: rootDir}
}

// ScanDirectory 扫描目录，返回所有音频文件
func (s *Scanner) ScanDirectory() (*ScanDirResult, error) {
	result := &ScanDirResult{
		Root:   s.RootDir,
		Files:  make([]ScanResult, 0),
		Errors: make([]string, 0),
	}

	// 检查目录是否存在
	info, err := os.Stat(s.RootDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("目录不存在: %s", s.RootDir)
		}
		return nil, fmt.Errorf("无法访问目录: %v", err)
	}

	if !info.IsDir() {
		return nil, fmt.Errorf("路径不是目录: %s", s.RootDir)
	}

	// 遍历目录
	err = filepath.Walk(s.RootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("访问失败 %s: %v", path, err))
			return nil // 继续扫描其他文件
		}

		// 跳过目录
		if info.IsDir() {
			return nil
		}

		// 检查扩展名
		ext := strings.ToLower(filepath.Ext(path))
		if !AudioExtensions[ext] {
			return nil
		}

		// 计算文件哈希
		hash, err := s.calculateFileHash(path)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("哈希失败 %s: %v", path, err))
			return nil
		}

		// 计算相对路径
		relative, _ := filepath.Rel(s.RootDir, path)

		s.mu.Lock()
		result.Files = append(result.Files, ScanResult{
			Path:     path,
			Name:     info.Name(),
			Ext:      ext,
			Size:     info.Size(),
			Hash:     hash,
			Relative: filepath.ToSlash(relative), // 统一使用正斜杠
		})
		s.mu.Unlock()

		return nil
	})

	if err != nil {
		return nil, err
	}

	result.Total = len(result.Files)
	return result, nil
}

// calculateFileHash 计算文件 SHA256 哈希
func (s *Scanner) calculateFileHash(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 对于大文件，只读取前 1MB + 后 1MB 进行哈希
	info, err := file.Stat()
	if err != nil {
		return "", err
	}

	hash := sha256.New()

	// 如果文件小于 2MB，读取全部
	if info.Size() < 2*1024*1024 {
		_, err = io.Copy(hash, file)
	} else {
		// 读取前 1MB
		io.CopyN(hash, file, 1*1024*1024)

		// 跳过中间部分（不计入哈希，节省时间）

		// 读取后 1MB
		file.Seek(-1*1024*1024, io.SeekEnd)
		_, err = io.Copy(hash, file)
	}

	if err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// CalculateSingleFileHash 计算单个文件的哈希
func CalculateSingleFileHash(filePath string) (string, error) {
	s := &Scanner{}
	return s.calculateFileHash(filePath)
}

// IsAudioFile 检查文件是否是音频文件
func IsAudioFile(filePath string) bool {
	ext := strings.ToLower(filepath.Ext(filePath))
	return AudioExtensions[ext]
}

// GetAudioExtensions 获取支持的音频扩展名列表
func GetAudioExtensions() []string {
	exts := make([]string, 0, len(AudioExtensions))
	for ext := range AudioExtensions {
		exts = append(exts, ext)
	}
	return exts
}
