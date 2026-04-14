package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/model"
	"backend/internal/repository"
)

type O3icsService struct {
	repo   *repository.Repository
	config *config.Config
}

func NewO3icsService(repo *repository.Repository, cfg *config.Config) *O3icsService {
	return &O3icsService{
		repo:   repo,
		config: cfg,
	}
}

type DeepSeekRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	MaxTokens int         `json:"max_tokens,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type DeepSeekResponse struct {
	ID      string   `json:"id"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

type Choice struct {
	Message Message `json:"message"`
}

type Message struct {
	Content string `json:"content"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

func (s *O3icsService) GenerateO3ics(req *model.GenerateRequest) (*model.GenerateResponse, error) {
	startTime := time.Now()
	
	var rulesContent string
	if req.UseRules {
		rules, _ := s.getActiveRules(req.Params)
		rulesContent = rules
	}

	var diceResult model.DiceResult
	if req.UseDice {
		diceResult = s.rollDice()
	}

	prompt := s.buildPrompt(req, rulesContent)
	
	var generatedText string
	if s.config.DeepSeek.APIKey != "" {
		text, err := s.callDeepSeek(prompt)
		if err != nil {
			return nil, fmt.Errorf("调用 DeepSeek 失败: %v", err)
		}
		generatedText = text
	} else {
		generatedText = s.getMockLyrics(req)
	}

	sunoPrompts := s.generateSunoPrompts(generatedText, req.Params.Style)

	response := &model.GenerateResponse{
		O3ics:        generatedText,
		SunoPrompts:  sunoPrompts,
		DiceResult:   diceResult,
		Metadata: model.Metadata{
			Model:           s.config.DeepSeek.Model,
			TokensUsed:      len(generatedText),
			GenerationTimeMs: int(time.Since(startTime).Milliseconds()),
		},
	}

	s.saveO3ics(req, response)
	
	return response, nil
}

func (s *O3icsService) buildPrompt(req *model.GenerateRequest, rulesContent string) string {
	var sb strings.Builder
	
	sb.WriteString("你是一位专业的歌词创作者，请根据以下要求创作歌词。\n\n")
	sb.WriteString(fmt.Sprintf("创作方向：%s\n", req.Content))
	sb.WriteString(fmt.Sprintf("情感基调：%s\n", req.Params.Emotion))
	sb.WriteString(fmt.Sprintf("歌曲主题：%s\n", req.Params.Theme))
	sb.WriteString(fmt.Sprintf("歌词风格：%s\n", req.Params.Style))
	sb.WriteString(fmt.Sprintf("韵律格式：%s\n", req.Params.Rhyme))
	sb.WriteString(fmt.Sprintf("歌曲长度：%s\n", req.Params.Length))

	if rulesContent != "" {
		sb.WriteString("\n创作规则：\n")
		sb.WriteString(rulesContent)
	}

	sb.WriteString("\n\n请创作一段完整的歌词，使用标准格式标记（如 [verse]、[chorus] 等）。")
	sb.WriteString("\n歌词要求：")
	sb.WriteString("\n1. 情感表达细腻、真挚")
	sb.WriteString("\n2. 韵律感强，朗朗上口")
	sb.WriteString("\n3. 画面感丰富，引人共鸣")
	sb.WriteString("\n4. 结构完整，包含verse、pre-chorus、chorus等部分")

	return sb.String()
}

func (s *O3icsService) callDeepSeek(prompt string) (string, error) {
	reqBody := DeepSeekRequest{
		Model: s.config.DeepSeek.Model,
		Messages: []ChatMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens: 2000,
	}

	jsonData, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", s.config.DeepSeek.URL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.config.DeepSeek.APIKey))

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result DeepSeekResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析响应失败: %v, body: %s", err, string(body))
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("DeepSeek 返回为空")
	}

	return result.Choices[0].Message.Content, nil
}

func (s *O3icsService) getMockLyrics(req *model.GenerateRequest) string {
	return fmt.Sprintf(`[verse1]
%s
%s
月光照亮我们的故事

[pre-chorus]
记忆像风一样轻轻吹过
留下淡淡的痕迹

[chorus]
在这%s的夜里
想起%s的温柔
%s是你给我的礼物

[verse2]
时光慢慢流淌
心中的%s越来越清晰
每一个%s的瞬间
都是%s的印记

[chorus]
在这%s的夜里
想起%s的温柔
%s是你给我的礼物

[bridge]
就算世界改变
这份情感不会褪色
%s永远在心中

[outro]
%s...`, 
		req.Params.Emotion, req.Params.Theme,
		req.Params.Emotion, req.Params.Theme,
		req.Params.Theme,
		req.Params.Emotion, req.Params.Style, req.Params.Theme,
		req.Params.Emotion, req.Params.Theme,
		req.Params.Theme,
		req.Params.Theme,
		req.Params.Emotion,
	)
}

func (s *O3icsService) rollDice() model.DiceResult {
	closingStyles := []string{"留下余韵", "戛然而止", "循环渐弱", "情感升华", "开放式结尾"}
	turningPoints := []string{"副歌之后", "第二段verse后", "桥段中", "副歌前", "间奏之后"}
	perspectives := []string{"无视角变化，第一人称", "从第三人称观察", "对话式表达", "时空交错", "未来视角回望"}
	rhetorics := []string{"比喻：把抽象情绪具象化", "拟人：赋予情感生命力", "排比：增强节奏感", "对比：强化情感冲突", "通感：打破感官界限"}
	lineVariations := []string{"长短交错", "短句为主", "长句为主", "对等句式", "自由句式"}

	return model.DiceResult{
		ClosingStyle:        closingStyles[time.Now().UnixNano()%5],
		TurningPoint:        turningPoints[time.Now().UnixNano()%5],
		Perspective:         perspectives[time.Now().UnixNano()%5],
		Rhetoric:            rhetorics[time.Now().UnixNano()%5],
		LineLengthVariation: lineVariations[time.Now().UnixNano()%5],
	}
}

func (s *O3icsService) generateSunoPrompts(lyrics string, style string) []string {
	prompts := []string{
		fmt.Sprintf("%s, emotional vocals, warm acoustic guitar, cinematic, 70 BPM, melancholic", style),
		fmt.Sprintf("%s, indie folk, piano and strings, storytelling, gentle build", style),
		fmt.Sprintf("%s, ambient, orchestral pads, ethereal atmosphere, instrumental intro", style),
	}
	return prompts
}

func (s *O3icsService) getActiveRules(params model.GenerateParams) (string, error) {
	var rules []model.Rule
	var ruleTypes = []string{params.Emotion, params.Theme, params.Style}
	var result string

	for _, ruleType := range ruleTypes {
		r, err := s.repo.GetRulesByType(ruleType)
		if err == nil && len(r) > 0 {
			rules = append(rules, r[0])
		}
	}

	for _, rule := range rules {
		result += fmt.Sprintf("[%s规则] %s\n%s\n", rule.Type, rule.Name, rule.Config)
	}

	return result, nil
}

func (s *O3icsService) saveO3ics(req *model.GenerateRequest, resp *model.GenerateResponse) {
	diceResultJSON, _ := json.Marshal(resp.DiceResult)
	sunoPromptsJSON, _ := json.Marshal(resp.SunoPrompts)

	o3ics := &model.O3ics{
		ProjectID:    req.ProjectID,
		Title:        generateTitle(req.Content),
		Content:      resp.O3ics,
		Emotion:      req.Params.Emotion,
		Theme:        req.Params.Theme,
		Style:        req.Params.Style,
		Rhyme:        req.Params.Rhyme,
		Length:       req.Params.Length,
		SunoPrompts:  string(sunoPromptsJSON),
		DiceResult:   string(diceResultJSON),
		OriginalText: req.Content,
	}

	s.repo.CreateO3ics(o3ics)
}

func generateTitle(content string) string {
	if len(content) > 20 {
		return content[:20] + "..."
	}
	return content
}