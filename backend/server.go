package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Project struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Desc       string `json:"description"`
	O3icsCount int    `json:"o3ics_count"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type O3ics struct {
	ID        string `json:"id"`
	ProjectID string `json:"project_id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	Emotion   string `json:"emotion"`
	Theme     string `json:"theme"`
	Style     string `json:"style"`
	Favorite  bool   `json:"favorite"`
	CreatedAt string `json:"created_at"`
}

type Rule struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Config      string `json:"config"`
	IsPublic    bool   `json:"is_public"`
}

var (
	projects    = []Project{}
	o3icsList   = []O3ics{}
	rulesList   = []Rule{}
	mu          sync.RWMutex
	projectNext int
	o3icsNext   int
	ruleNext    int
)

func init() {
	now := time.Now().Format(time.RFC3339)
	rulesList = []Rule{
		{ID: "1", Name: "失恋疗愈", Type: "emotion", Description: "适合表达失恋后逐渐释怀的情绪", Config: "放下\n释然\n解脱\n从容\n淡然", IsPublic: true},
		{ID: "2", Name: "甜蜜爱情", Type: "emotion", Description: "适合表达甜蜜、温暖的情感", Config: "心动\n甜蜜\n温暖\n幸福", IsPublic: true},
		{ID: "3", Name: "追梦之路", Type: "theme", Description: "适合表达追逐梦想的主题", Config: "坚持\n勇敢\n希望\n前行", IsPublic: true},
		{ID: "4", Name: "民谣风格", Type: "style", Description: "民谣风格的歌词创作规则", Config: "故事感强\n叙事为主\n画面丰富", IsPublic: true},
		{ID: "5", Name: "流行风格", Type: "style", Description: "流行风格的歌词创作规则", Config: "朗朗上口\n副歌有力\n情感直接", IsPublic: true},
	}
	projectNext = 1
	o3icsNext = 1
	ruleNext = 6
}

func response(c *gin.Context, data interface{}) {
	c.JSON(200, gin.H{"code": 0, "message": "success", "data": data})
}

func main() {
	gin.SetMode("debug")
	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		response(c, gin.H{"status": "ok", "version": "1.0.0"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/options", func(c *gin.Context) {
			response(c, gin.H{
				"emotions":  []string{"悲伤", "喜悦", "浪漫", "励志", "平静", "愤怒", "迷茫", "感恩"},
				"themes":    []string{"爱情", "友情", "成长", "自然", "生活", "梦想", "回忆", "未来"},
				"styles":     []string{"流行", "古风", "民谣", "说唱", "情歌", "摇滚", "电子", "轻音乐"},
				"rhymes":     []string{"AABB", "ABAB", "自由韵", "AAAA", "ABBA"},
				"lengths":    []string{"短歌(16句)", "中等(24句)", "长歌(32句+)"},
				"ruleTypes": []string{"emotion", "theme", "style", "rhyme", "length", "custom"},
			})
		})

		api.POST("/projects", func(c *gin.Context) {
			var body struct{ Name string `json:"name"`; Description string `json:"description"` }
			c.BindJSON(&body)
			mu.Lock()
			p := Project{
				ID:         fmt.Sprintf("%d", projectNext),
				Name:       body.Name,
				Desc:       body.Description,
				CreatedAt:  time.Now().Format(time.RFC3339),
				UpdatedAt:  time.Now().Format(time.RFC3339),
			}
			projectNext++
			projects = append([]Project{p}, projects...)
			mu.Unlock()
			response(c, p)
		})

		api.GET("/projects", func(c *gin.Context) {
			mu.RLock()
			defer mu.RUnlock()
			response(c, gin.H{"projects": projects, "total": len(projects)})
		})

		api.POST("/o3ics/generate", func(c *gin.Context) {
			var body struct {
				Content   string `json:"content"`
				ProjectID string `json:"project_id"`
				Params    struct {
					Emotion string `json:"emotion"`
					Theme   string `json:"theme"`
					Style   string `json:"style"`
				}
				UseRules bool `json:"use_rules"`
				UseDice  bool `json:"use_dice"`
			}
			c.BindJSON(&body)

			lyrics := generateLyrics(body.Content, body.Params)
			dice := rollDice()

			mu.Lock()
			o := O3ics{
				ID:        fmt.Sprintf("%d", o3icsNext),
				ProjectID: body.ProjectID,
				Title:     body.Content[:min(20, len(body.Content))],
				Content:   lyrics,
				Emotion:   body.Params.Emotion,
				Theme:     body.Params.Theme,
				Style:     body.Params.Style,
				CreatedAt: time.Now().Format(time.RFC3339),
			}
			o3icsNext++
			o3icsList = append([]O3ics{o}, o3icsList...)
			mu.Unlock()

			response(c, gin.H{
				"o3ics": lyrics,
				"suno_prompts": []string{
					fmt.Sprintf("%s, emotional vocals, warm guitar, cinematic", body.Params.Style),
					fmt.Sprintf("%s, indie folk, piano and strings", body.Params.Style),
					fmt.Sprintf("%s, ambient, orchestral pads", body.Params.Style),
				},
				"dice_result": dice,
				"metadata": gin.H{
					"model":            "mock",
					"tokens_used":      len(lyrics),
					"generation_time_ms": 100,
				},
			})
		})

		api.GET("/o3ics", func(c *gin.Context) {
			projectID := c.Query("project_id")
			mu.RLock()
			var filtered []O3ics
			for _, o := range o3icsList {
				if projectID == "" || o.ProjectID == projectID {
					filtered = append(filtered, o)
				}
			}
			mu.RUnlock()
			response(c, gin.H{"o3ics": filtered, "total": len(filtered)})
		})

		api.GET("/rules", func(c *gin.Context) {
			mu.RLock()
			defer mu.RUnlock()
			response(c, gin.H{"rules": rulesList, "total": len(rulesList)})
		})
	}

	log.Println("服务器启动在 http://localhost:8080")
	r.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func generateLyrics(content string, params struct{ Emotion string; Theme string; Style string }) string {
	return fmt.Sprintf(`[verse1]
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

[chorus]
在这%s的夜里
想起%s的温柔
%s是你给我的礼物

[bridge]
就算世界改变
这份情感不会褪色
%s永远在心中

[outro]
%s...`, content, params.Emotion, params.Theme, params.Theme, params.Emotion, params.Style, params.Emotion, params.Theme, params.Theme, params.Theme, params.Emotion)
}

func rollDice() gin.H {
	now := time.Now().UnixNano()
	return gin.H{
		"closing_style":        []string{"留下余韵", "戛然而止", "循环渐弱", "情感升华"}[now%4],
		"turning_point":        []string{"副歌之后", "第二段verse后", "桥段中", "副歌前"}[now%4],
		"perspective":          []string{"第一人称", "第三人称观察", "对话式", "时空交错"}[now%4],
		"rhetoric":             []string{"比喻", "拟人", "排比", "对比"}[now%4],
		"line_length_variation": []string{"长短交错", "短句为主", "长句为主", "对等句式"}[now%4],
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}