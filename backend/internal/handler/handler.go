package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"backend/internal/config"
	"backend/internal/model"
	"backend/internal/pkg/response"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo         *repository.Repository
	o3icsService *service.O3icsService
	config       *config.Config
}

func NewHandler(repo *repository.Repository, o3icsService *service.O3icsService, cfg *config.Config) *Handler {
	return &Handler{
		repo:         repo,
		o3icsService: o3icsService,
		config:       cfg,
	}
}

// Project Handlers

func (h *Handler) CreateProject(c *gin.Context) {
	var project model.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateProject(&project); err != nil {
		response.Error(c, 500, "创建项目失败")
		return
	}

	response.SuccessWithMsg(c, "创建成功", project)
}

func (h *Handler) GetProjects(c *gin.Context) {
	projects, err := h.repo.GetProjects()
	if err != nil {
		response.Error(c, 500, "获取项目列表失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"projects": projects,
		"total":    len(projects),
	})
}

func (h *Handler) GetProject(c *gin.Context) {
	id := c.Param("id")
	project, err := h.repo.GetProject(id)
	if err != nil {
		response.Error(c, 404, "项目不存在")
		return
	}

	response.Success(c, project)
}

func (h *Handler) UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project model.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	project.ID = id
	if err := h.repo.UpdateProject(&project); err != nil {
		response.Error(c, 500, "更新项目失败")
		return
	}

	response.SuccessWithMsg(c, "更新成功", project)
}

func (h *Handler) DeleteProject(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteProject(id); err != nil {
		response.Error(c, 500, "删除项目失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

// O3ics Handlers

func (h *Handler) GenerateO3ics(c *gin.Context) {
	var req model.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "无效的请求数据: "+err.Error())
		return
	}

	result, err := h.o3icsService.GenerateO3ics(&req)
	if err != nil {
		response.Error(c, 500, err.Error())
		return
	}

	response.Success(c, result)
}

func (h *Handler) GetO3icsList(c *gin.Context) {
	projectID := c.Query("project_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	page, pageSize = repository.CalculatePagination(page, pageSize)

	o3icsList, total, err := h.repo.GetO3icsList(projectID, page, pageSize)
	if err != nil {
		response.Error(c, 500, "获取歌词列表失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"o3ics":     o3icsList,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *Handler) GetO3ics(c *gin.Context) {
	id := c.Param("id")
	o3ics, err := h.repo.GetO3ics(id)
	if err != nil {
		response.Error(c, 404, "歌词不存在")
		return
	}

	response.Success(c, o3ics)
}

func (h *Handler) UpdateO3ics(c *gin.Context) {
	id := c.Param("id")
	var o3ics model.O3ics
	if err := c.ShouldBindJSON(&o3ics); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	o3ics.ID = id
	if err := h.repo.UpdateO3ics(&o3ics); err != nil {
		response.Error(c, 500, "更新歌词失败")
		return
	}

	response.SuccessWithMsg(c, "更新成功", o3ics)
}

func (h *Handler) DeleteO3ics(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteO3ics(id); err != nil {
		response.Error(c, 500, "删除歌词失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

func (h *Handler) ToggleFavorite(c *gin.Context) {
	id := c.Param("id")
	favorite, err := h.repo.ToggleFavorite(id)
	if err != nil {
		response.Error(c, 500, "操作失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"favorite": favorite,
	})
}

// Rule Handlers

func (h *Handler) CreateRule(c *gin.Context) {
	var rule model.Rule
	if err := c.ShouldBindJSON(&rule); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateRule(&rule); err != nil {
		response.Error(c, 500, "创建规则失败")
		return
	}

	response.SuccessWithMsg(c, "创建成功", rule)
}

func (h *Handler) GetRules(c *gin.Context) {
	ruleType := c.Query("type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	page, pageSize = repository.CalculatePagination(page, pageSize)

	rules, total, err := h.repo.GetRules(ruleType, page, pageSize)
	if err != nil {
		response.Error(c, 500, "获取规则列表失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"rules":     rules,
		"total":    total,
		"page":     page,
		"page_size": pageSize,
	})
}

func (h *Handler) GetFeaturedRules(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	rules, err := h.repo.GetFeaturedRules(limit)
	if err != nil {
		response.Error(c, 500, "获取精选规则失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"rules": rules,
	})
}

func (h *Handler) GetRule(c *gin.Context) {
	id := c.Param("id")
	rule, err := h.repo.GetRule(id)
	if err != nil {
		response.Error(c, 404, "规则不存在")
		return
	}

	response.Success(c, rule)
}

func (h *Handler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var rule model.Rule
	if err := c.ShouldBindJSON(&rule); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	rule.ID = id
	if err := h.repo.UpdateRule(&rule); err != nil {
		response.Error(c, 500, "更新规则失败")
		return
	}

	response.SuccessWithMsg(c, "更新成功", rule)
}

func (h *Handler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteRule(id); err != nil {
		response.Error(c, 500, "删除规则失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

func (h *Handler) ImportRule(c *gin.Context) {
	var data struct {
		Rule model.Rule `json:"rule"`
	}
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateRule(&data.Rule); err != nil {
		response.Error(c, 500, "导入规则失败")
		return
	}

	response.SuccessWithMsg(c, "导入成功", map[string]interface{}{
		"id": data.Rule.ID,
	})
}

func (h *Handler) ExportRule(c *gin.Context) {
	id := c.Param("id")
	rule, err := h.repo.GetRule(id)
	if err != nil {
		response.Error(c, 404, "规则不存在")
		return
	}

	exportData := map[string]interface{}{
		"name":        rule.Name,
		"type":        rule.Type,
		"author":      rule.Author,
		"version":     rule.Version,
		"tags":        rule.Tags,
		"description": rule.Description,
		"config":      rule.Config,
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    exportData,
	})
}

// Options

func (h *Handler) GetOptions(c *gin.Context) {
	options := map[string]interface{}{
		"emotions": []string{"悲伤", "喜悦", "浪漫", "励志", "平静", "愤怒", "迷茫", "感恩"},
		"themes":   []string{"爱情", "友情", "成长", "自然", "生活", "梦想", "回忆", "未来"},
		"styles":   []string{"流行", "古风", "民谣", "说唱", "情歌", "摇滚", "电子", "轻音乐"},
		"rhymes":   []string{"AABB", "ABAB", "自由韵", "AAAA", "ABBA"},
		"lengths":  []string{"短歌(16句)", "中等(24句)", "长歌(32句+)"},
		"ruleTypes": []string{"emotion", "theme", "style", "rhyme", "length", "custom"},
	}

	response.Success(c, options)
}

// ============ MusicTrack Handlers ============

func (h *Handler) GetMusicTracksByO3ics(c *gin.Context) {
	o3icsID := c.Query("o3ics_id")
	if o3icsID == "" {
		response.Error(c, 400, "缺少 o3ics_id 参数")
		return
	}

	tracks, err := h.repo.GetMusicTracksByO3ics(o3icsID)
	if err != nil {
		response.Error(c, 500, "获取音乐轨道失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"tracks": tracks,
		"total":  len(tracks),
	})
}

func (h *Handler) CreateMusicTrack(c *gin.Context) {
	var track model.MusicTrack
	if err := c.ShouldBindJSON(&track); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateMusicTrack(&track); err != nil {
		response.Error(c, 500, "创建音乐轨道失败")
		return
	}

	response.SuccessWithMsg(c, "创建成功", track)
}

func (h *Handler) UpdateMusicTrack(c *gin.Context) {
	id := c.Param("id")
	var track model.MusicTrack
	if err := c.ShouldBindJSON(&track); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	track.ID = id
	if err := h.repo.UpdateMusicTrack(&track); err != nil {
		response.Error(c, 500, "更新音乐轨道失败")
		return
	}

	response.SuccessWithMsg(c, "更新成功", track)
}

func (h *Handler) DeleteMusicTrack(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteMusicTrack(id); err != nil {
		response.Error(c, 500, "删除音乐轨道失败")
		return
	}

	response.SuccessWithMsg(c, "删除成功", nil)
}

func (h *Handler) GetMusicTrackByTaskId(c *gin.Context) {
	taskID := c.Query("task_id")
	if taskID == "" {
		response.Error(c, 400, "缺少 task_id 参数")
		return
	}

	track, err := h.repo.GetMusicTrackByTaskID(taskID)
	if err != nil {
		response.Error(c, 404, "音乐轨道不存在")
		return
	}

	response.Success(c, track)
}

// ============ ApiLog Handlers ============

func (h *Handler) CreateApiLog(c *gin.Context) {
	var log model.ApiLog
	if err := c.ShouldBindJSON(&log); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateApiLog(&log); err != nil {
		response.Error(c, 500, "创建日志失败")
		return
	}

	response.SuccessWithMsg(c, "创建成功", log)
}

func (h *Handler) GetRecentApiLogs(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	logs, err := h.repo.GetRecentApiLogs(limit)
	if err != nil {
		response.Error(c, 500, "获取日志失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"logs":  logs,
		"total": len(logs),
	})
}

// ============ Suno Handlers ============

func (h *Handler) SunoSubmit(c *gin.Context) {
	var params model.SunoSubmitParams
	if err := c.ShouldBindJSON(&params); err != nil {
		response.Error(c, 400, "无效的请求数据: "+err.Error())
		return
	}

	apiKey := h.config.Suno.APIKey
	baseURL := h.config.Suno.BaseURL

	if apiKey == "" {
		response.Error(c, 400, "请先配置 SUNO_API_KEY 环境变量")
		return
	}

	if baseURL == "" {
		baseURL = "https://api.sunoai.com"
	}

	// 构建请求体
	reqBody, _ := json.Marshal(params)

	req, err := http.NewRequest("POST", baseURL+"/suno/submit/music", bytes.NewBuffer(reqBody))
	if err != nil {
		response.Error(c, 500, "创建请求失败")
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		response.Error(c, 500, "提交失败: "+err.Error())
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error(c, 500, "读取响应失败")
		return
	}

	if resp.StatusCode != 200 {
		response.Error(c, resp.StatusCode, fmt.Sprintf("Suno API 错误: %s", string(body)))
		return
	}

	var result model.SunoSubmitResponse
	if err := json.Unmarshal(body, &result); err != nil {
		response.Error(c, 500, "解析响应失败")
		return
	}

	// 自动创建 MusicTrack 记录
	track := &model.MusicTrack{
		O3icsID:      params.O3ics,
		TaskID:       result.TaskID,
		Title:        params.Title,
		Status:       "submitted",
		Style:        params.Model,
		Model:        params.Model,
		Instrumental: params.MakeInstrumental,
	}
	h.repo.CreateMusicTrack(track)

	response.Success(c, result)
}

func (h *Handler) SunoFetch(c *gin.Context) {
	var body struct {
		TaskIDs []string `json:"task_ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if len(body.TaskIDs) == 0 {
		response.Success(c, map[string]interface{}{"tasks": []interface{}{}})
		return
	}

	apiKey := h.config.Suno.APIKey
	baseURL := h.config.Suno.BaseURL

	if apiKey == "" {
		response.Error(c, 400, "请先配置 SUNO_API_KEY 环境变量")
		return
	}

	if baseURL == "" {
		baseURL = "https://api.sunoai.com"
	}

	reqBody, _ := json.Marshal(map[string]interface{}{"task_ids": body.TaskIDs})

	req, err := http.NewRequest("POST", baseURL+"/suno/fetch", bytes.NewBuffer(reqBody))
	if err != nil {
		response.Error(c, 500, "创建请求失败")
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		response.Error(c, 500, "查询失败: "+err.Error())
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error(c, 500, "读取响应失败")
		return
	}

	if resp.StatusCode != 200 {
		response.Error(c, resp.StatusCode, fmt.Sprintf("Suno API 错误: %s", string(respBody)))
		return
	}

	var result model.SunoFetchResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		response.Error(c, 500, "解析响应失败")
		return
	}

	// 更新 MusicTrack 状态
	for _, task := range result.Tasks {
		updateData := map[string]interface{}{
			"status": MapSunoStatus(task.Status),
		}
		if task.FailReason != "" {
			updateData["fail_reason"] = task.FailReason
		}
		if len(task.Data.Songs) > 0 {
			song := task.Data.Songs[0]
			updateData["suno_song_id"] = song.ID
			updateData["audio_url"] = song.AudioURL
			updateData["video_url"] = song.VideoURL
			updateData["cover_image_url"] = song.ImageURL
			if task.Status == "SUCCESS" {
				updateData["status"] = "success"
			} else if task.Status == "FAILURE" {
				updateData["status"] = "failure"
			}
		}
		h.repo.UpdateMusicTrackByTaskID(task.TaskID, updateData)
	}

	// 返回给前端的数据格式
	tasks := make([]map[string]interface{}, 0, len(result.Tasks))
	for _, task := range result.Tasks {
		taskMap := map[string]interface{}{
			"taskId": task.TaskID,
			"status": MapSunoStatus(task.Status),
			"progress": GetStatusProgress(MapSunoStatus(task.Status)),
			"failReason": task.FailReason,
			"songs": task.Data.Songs,
		}
		tasks = append(tasks, taskMap)
	}

	response.Success(c, map[string]interface{}{"tasks": tasks})
}

// MapSunoStatus 将 Suno 状态映射为内部状态
func MapSunoStatus(sunoStatus string) string {
	switch sunoStatus {
	case "NOT_START":
		return "pending"
	case "SUBMITTED", "QUEUED":
		return "submitted"
	case "IN_PROGRESS":
		return "in_progress"
	case "SUCCESS":
		return "success"
	case "FAILURE":
		return "failure"
	default:
		return "pending"
	}
}

// GetStatusProgress 获取状态进度百分比
func GetStatusProgress(status string) int {
	switch status {
	case "pending":
		return 0
	case "submitted":
		return 20
	case "queued":
		return 40
	case "in_progress":
		return 70
	case "success":
		return 100
	case "failure":
		return 100
	default:
		return 0
	}
}

// Health Check
func (h *Handler) HealthCheck(c *gin.Context) {
	response.Success(c, map[string]interface{}{
		"status":  "ok",
		"version": "1.0.0",
	})
}

// ============ LocalLibrary Handlers (方案B/C) ============

func (h *Handler) GetLocalSongs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	artistName := c.Query("artist")

	page, pageSize = repository.CalculatePagination(page, pageSize)

	var songs []model.LocalSong
	var total int64
	var err error

	if artistName != "" {
		songs, total, err = h.repo.GetLocalSongsByArtist(artistName, page, pageSize)
	} else {
		songs, total, err = h.repo.GetLocalSongs(page, pageSize)
	}

	if err != nil {
		response.Error(c, 500, "获取歌曲列表失败")
		return
	}

	response.Success(c, map[string]interface{}{
		"songs":    songs,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *Handler) CreateLocalSong(c *gin.Context) {
	var song model.LocalSong
	if err := c.ShouldBindJSON(&song); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}

	if err := h.repo.CreateLocalSong(&song); err != nil {
		response.Error(c, 500, "创建歌曲失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(c, "创建成功", song)
}

func (h *Handler) UpdateLocalSong(c *gin.Context) {
	id := c.Param("id")
	var song model.LocalSong
	if err := c.ShouldBindJSON(&song); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	song.ID = id
	if err := h.repo.UpdateLocalSong(&song); err != nil {
		response.Error(c, 500, "更新歌曲失败")
		return
	}
	response.SuccessWithMsg(c, "更新成功", song)
}

func (h *Handler) DeleteLocalSong(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteLocalSong(id); err != nil {
		response.Error(c, 500, "删除歌曲失败")
		return
	}
	response.SuccessWithMsg(c, "删除成功", nil)
}

func (h *Handler) PlayLocalSong(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.IncrementLocalSongPlayCount(id); err != nil {
		response.Error(c, 500, "更新播放次数失败")
		return
	}
	song, err := h.repo.GetLocalSong(id)
	if err != nil {
		response.Error(c, 404, "歌曲不存在")
		return
	}
	response.Success(c, song)
}

func (h *Handler) ToggleLocalSongFavorite(c *gin.Context) {
	id := c.Param("id")
	fav, err := h.repo.ToggleLocalSongFavorite(id)
	if err != nil {
		response.Error(c, 500, "操作失败")
		return
	}
	response.Success(c, map[string]interface{}{"favorite": fav})
}

func (h *Handler) GetLocalArtists(c *gin.Context) {
	artists, err := h.repo.GetLocalArtists()
	if err != nil {
		response.Error(c, 500, "获取歌手列表失败")
		return
	}
	response.Success(c, map[string]interface{}{"artists": artists})
}

func (h *Handler) GetLocalAlbums(c *gin.Context) {
	albums, err := h.repo.GetLocalAlbums()
	if err != nil {
		response.Error(c, 500, "获取专辑列表失败")
		return
	}
	response.Success(c, map[string]interface{}{"albums": albums})
}

func (h *Handler) GetLocalPlaylists(c *gin.Context) {
	playlists, err := h.repo.GetLocalPlaylists()
	if err != nil {
		response.Error(c, 500, "获取歌单列表失败")
		return
	}
	response.Success(c, map[string]interface{}{"playlists": playlists})
}

func (h *Handler) CreateLocalPlaylist(c *gin.Context) {
	var playlist model.LocalPlaylist
	if err := c.ShouldBindJSON(&playlist); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if err := h.repo.CreateLocalPlaylist(&playlist); err != nil {
		response.Error(c, 500, "创建歌单失败")
		return
	}
	response.SuccessWithMsg(c, "创建成功", playlist)
}

func (h *Handler) DeleteLocalPlaylist(c *gin.Context) {
	id := c.Param("id")
	if err := h.repo.DeleteLocalPlaylist(id); err != nil {
		response.Error(c, 500, "删除歌单失败")
		return
	}
	response.SuccessWithMsg(c, "删除成功", nil)
}

func (h *Handler) GetLocalPlaylistSongs(c *gin.Context) {
	id := c.Param("id")
	songs, err := h.repo.GetLocalPlaylistSongs(id)
	if err != nil {
		response.Error(c, 500, "获取歌单歌曲失败")
		return
	}
	response.Success(c, map[string]interface{}{"songs": songs})
}

func (h *Handler) AddSongToPlaylist(c *gin.Context) {
	var body struct {
		PlaylistID string `json:"playlist_id"`
		SongID     string `json:"song_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if err := h.repo.AddSongToPlaylist(body.PlaylistID, body.SongID); err != nil {
		response.Error(c, 500, "添加歌曲失败")
		return
	}
	response.SuccessWithMsg(c, "添加成功", nil)
}

func (h *Handler) RemoveSongFromPlaylist(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		SongID string `json:"song_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if err := h.repo.RemoveSongFromPlaylist(id, body.SongID); err != nil {
		response.Error(c, 500, "移除歌曲失败")
		return
	}
	response.SuccessWithMsg(c, "移除成功", nil)
}

// ImportSongs - 批量导入歌曲（方案C用，接收文件哈希+元数据）
func (h *Handler) ImportSongs(c *gin.Context) {
	var songs []model.LocalSong
	if err := c.ShouldBindJSON(&songs); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	imported := 0
	skipped := 0
	for i := range songs {
		if songs[i].FileHash != "" {
			existing, _ := h.repo.GetLocalSongByHash(songs[i].FileHash)
			if existing != nil {
				skipped++
				continue
			}
		}
		if err := h.repo.CreateLocalSong(&songs[i]); err == nil {
			imported++
		}
	}
	response.Success(c, map[string]interface{}{
		"imported": imported,
		"skipped":  skipped,
		"total":    len(songs),
	})
}

// ============ Player API Handlers ============

// GetPlayerState 获取播放器状态
func (h *Handler) GetPlayerState(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "default")
	state, err := h.repo.GetPlayerState(userID)
	if err != nil {
		response.Error(c, 500, "获取播放器状态失败")
		return
	}
	if state == nil {
		// 返回默认状态
		response.Success(c, map[string]interface{}{
			"user_id":     userID,
			"source_type": "local",
			"source_id":   "",
			"current_time": 0,
			"volume":       0.8,
			"is_playing":   false,
			"repeat_mode":  "none",
			"shuffle":      false,
		})
		return
	}
	response.Success(c, state)
}

// SavePlayerState 保存播放器状态
func (h *Handler) SavePlayerState(c *gin.Context) {
	var state model.PlayerState
	if err := c.ShouldBindJSON(&state); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if state.UserID == "" {
		state.UserID = "default"
	}
	if err := h.repo.SavePlayerState(&state); err != nil {
		response.Error(c, 500, "保存播放器状态失败")
		return
	}
	response.Success(c, state)
}

// GetPlayHistory 获取播放历史
func (h *Handler) GetPlayHistory(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "default")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	history, err := h.repo.GetPlayHistory(userID, limit)
	if err != nil {
		response.Error(c, 500, "获取播放历史失败")
		return
	}
	response.Success(c, map[string]interface{}{
		"history": history,
		"total":   len(history),
	})
}

// AddPlayHistory 添加播放历史
func (h *Handler) AddPlayHistory(c *gin.Context) {
	var entry model.PlayHistory
	if err := c.ShouldBindJSON(&entry); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if entry.UserID == "" {
		entry.UserID = "default"
	}
	if err := h.repo.AddPlayHistory(&entry); err != nil {
		response.Error(c, 500, "添加播放历史失败")
		return
	}
	response.Success(c, entry)
}

// ClearPlayHistory 清除播放历史
func (h *Handler) ClearPlayHistory(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "default")
	if err := h.repo.ClearPlayHistory(userID); err != nil {
		response.Error(c, 500, "清除播放历史失败")
		return
	}
	response.SuccessWithMsg(c, "清除成功", nil)
}

// GetFavorites 获取收藏列表
func (h *Handler) GetFavorites(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "default")
	songType := c.Query("type")
	favorites, err := h.repo.GetFavorites(userID, songType)
	if err != nil {
		response.Error(c, 500, "获取收藏列表失败")
		return
	}
	response.Success(c, map[string]interface{}{
		"favorites": favorites,
		"total":    len(favorites),
	})
}

// AddFavorite 添加收藏
func (h *Handler) AddFavorite(c *gin.Context) {
	var fav model.FavoriteSong
	if err := c.ShouldBindJSON(&fav); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	if fav.UserID == "" {
		fav.UserID = "default"
	}
	if err := h.repo.AddFavorite(&fav); err != nil {
		response.Error(c, 500, "添加收藏失败")
		return
	}
	response.Success(c, fav)
}

// RemoveFavorite 移除收藏
func (h *Handler) RemoveFavorite(c *gin.Context) {
	var params struct {
		UserID  string `json:"user_id"`
		SongID  string `json:"song_id"`
		SongType string `json:"song_type"`
	}
	if err := c.ShouldBindJSON(&params); err != nil {
		response.Error(c, 400, "无效的请求数据")
		return
	}
	userID := params.UserID
	if userID == "" {
		userID = "default"
	}
	if err := h.repo.RemoveFavorite(userID, params.SongID, params.SongType); err != nil {
		response.Error(c, 500, "移除收藏失败")
		return
	}
	response.SuccessWithMsg(c, "移除成功", nil)
}

// CheckFavorite 检查是否已收藏
func (h *Handler) CheckFavorite(c *gin.Context) {
	userID := c.DefaultQuery("user_id", "default")
	songID := c.Query("song_id")
	songType := c.Query("type")
	isFav, err := h.repo.IsFavorite(userID, songID, songType)
	if err != nil {
		response.Error(c, 500, "检查收藏状态失败")
		return
	}
	response.Success(c, map[string]interface{}{
		"is_favorite": isFav,
	})
}

// SearchSongs 搜索歌曲
func (h *Handler) SearchSongs(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		response.Error(c, 400, "搜索关键词不能为空")
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	page, pageSize = repository.CalculatePagination(page, pageSize)
	songs, total, err := h.repo.SearchSongs(query, page, pageSize)
	if err != nil {
		response.Error(c, 500, "搜索失败")
		return
	}
	response.Success(c, map[string]interface{}{
		"songs":     songs,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}
