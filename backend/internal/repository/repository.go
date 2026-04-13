package repository

import (
	"fmt"
	"math"

	"backend/internal/model"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Project CRUD
func (r *Repository) CreateProject(project *model.Project) error {
	return r.db.Create(project).Error
}

func (r *Repository) GetProjects() ([]model.Project, error) {
	var projects []model.Project
	err := r.db.Order("created_at desc").Find(&projects).Error
	return projects, err
}

func (r *Repository) GetProject(id string) (*model.Project, error) {
	var project model.Project
	err := r.db.First(&project, "id = ?", id).Error
	return &project, err
}

func (r *Repository) UpdateProject(project *model.Project) error {
	return r.db.Save(project).Error
}

func (r *Repository) DeleteProject(id string) error {
	return r.db.Delete(&model.Project{}, "id = ?", id).Error
}

// O3ics CRUD
func (r *Repository) CreateO3ics(o3ics *model.O3ics) error {
	err := r.db.Create(o3ics).Error
	if err == nil && o3ics.ProjectID != "" {
		r.db.Model(&model.Project{}).Where("id = ?", o3ics.ProjectID).
			UpdateColumn("o3ics_count", gorm.Expr("o3ics_count + ?", 1))
	}
	return err
}

func (r *Repository) GetO3icsList(projectID string, page, pageSize int) ([]model.O3ics, int64, error) {
	var o3icsList []model.O3ics
	var total int64

	query := r.db.Model(&model.O3ics{})
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&o3icsList).Error

	return o3icsList, total, err
}

func (r *Repository) GetO3ics(id string) (*model.O3ics, error) {
	var o3ics model.O3ics
	err := r.db.First(&o3ics, "id = ?", id).Error
	return &o3ics, err
}

func (r *Repository) UpdateO3ics(o3ics *model.O3ics) error {
	return r.db.Save(o3ics).Error
}

func (r *Repository) DeleteO3ics(id string) error {
	var o3ics model.O3ics
	if err := r.db.First(&o3ics, "id = ?", id).Error; err == nil && o3ics.ProjectID != "" {
		r.db.Model(&model.Project{}).Where("id = ?", o3ics.ProjectID).
			UpdateColumn("o3ics_count", gorm.Expr("o3ics_count - ?", 1))
	}
	return r.db.Delete(&model.O3ics{}, "id = ?", id).Error
}

func (r *Repository) ToggleFavorite(id string) (bool, error) {
	var o3ics model.O3ics
	err := r.db.First(&o3ics, "id = ?", id).Error
	if err != nil {
		return false, err
	}
	o3ics.Favorite = !o3ics.Favorite
	err = r.db.Save(&o3ics).Error
	return o3ics.Favorite, err
}

// Rule CRUD
func (r *Repository) CreateRule(rule *model.Rule) error {
	return r.db.Create(rule).Error
}

func (r *Repository) GetRules(ruleType string, page, pageSize int) ([]model.Rule, int64, error) {
	var rules []model.Rule
	var total int64

	query := r.db.Model(&model.Rule{}).Where("is_active = ?", true)
	if ruleType != "" {
		query = query.Where("type = ?", ruleType)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Order("priority desc, use_count desc").Offset(offset).Limit(pageSize).Find(&rules).Error

	return rules, total, err
}

func (r *Repository) GetFeaturedRules(limit int) ([]model.Rule, error) {
	var rules []model.Rule
	err := r.db.Where("is_public = ? AND is_active = ?", true, true).
		Order("like_count desc, use_count desc").Limit(limit).Find(&rules).Error
	return rules, err
}

func (r *Repository) GetRule(id string) (*model.Rule, error) {
	var rule model.Rule
	err := r.db.First(&rule, "id = ?", id).Error
	return &rule, err
}

func (r *Repository) GetRulesByType(ruleType string) ([]model.Rule, error) {
	var rules []model.Rule
	err := r.db.Where("type = ? AND is_active = ?", ruleType, true).Find(&rules).Error
	return rules, err
}

func (r *Repository) UpdateRule(rule *model.Rule) error {
	return r.db.Save(rule).Error
}

func (r *Repository) DeleteRule(id string) error {
	return r.db.Delete(&model.Rule{}, "id = ?", id).Error
}

func (r *Repository) IncrementRuleUseCount(id string) error {
	return r.db.Model(&model.Rule{}).Where("id = ?", id).
		UpdateColumn("use_count", gorm.Expr("use_count + ?", 1)).Error
}

func (r *Repository) IncrementRuleLikeCount(id string) error {
	return r.db.Model(&model.Rule{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("like_count + ?", 1)).Error
}

// Pagination helper
func CalculatePagination(page, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return page, pageSize
}

func CalculateTotalPages(total int64, pageSize int) int {
	return int(math.Ceil(float64(total) / float64(pageSize)))
}

// ============ MusicTrack CRUD ============

func (r *Repository) CreateMusicTrack(track *model.MusicTrack) error {
	return r.db.Create(track).Error
}

func (r *Repository) GetMusicTracksByO3ics(o3icsID string) ([]model.MusicTrack, error) {
	var tracks []model.MusicTrack
	err := r.db.Where("o3ics_id = ?", o3icsID).
		Order("created_at desc").Find(&tracks).Error
	return tracks, err
}

func (r *Repository) GetMusicTrackByTaskID(taskID string) (*model.MusicTrack, error) {
	var track model.MusicTrack
	err := r.db.Where("task_id = ?", taskID).First(&track).Error
	return &track, err
}

func (r *Repository) GetMusicTrack(id string) (*model.MusicTrack, error) {
	var track model.MusicTrack
	err := r.db.First(&track, "id = ?", id).Error
	return &track, err
}

func (r *Repository) UpdateMusicTrack(track *model.MusicTrack) error {
	return r.db.Save(track).Error
}

func (r *Repository) DeleteMusicTrack(id string) error {
	return r.db.Delete(&model.MusicTrack{}, "id = ?", id).Error
}

func (r *Repository) UpdateMusicTrackByTaskID(taskID string, data map[string]interface{}) error {
	return r.db.Model(&model.MusicTrack{}).Where("task_id = ?", taskID).Updates(data).Error
}

// ============ ApiLog CRUD ============

func (r *Repository) CreateApiLog(log *model.ApiLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) GetRecentApiLogs(limit int) ([]model.ApiLog, error) {
	var logs []model.ApiLog
	err := r.db.Order("created_at desc").Limit(limit).Find(&logs).Error
	return logs, err
}

func (r *Repository) GetApiLogsByModel(modelName string, limit int) ([]model.ApiLog, error) {
	var logs []model.ApiLog
	err := r.db.Where("model = ?", modelName).
		Order("created_at desc").Limit(limit).Find(&logs).Error
	return logs, err
}

// ============ LocalLibrary CRUD (方案B/C) ============

// Artist
func (r *Repository) CreateOrGetArtist(name string) (*model.LocalArtist, error) {
	var artist model.LocalArtist
	err := r.db.FirstOrCreate(&artist, model.LocalArtist{Name: name}).Error
	return &artist, err
}

func (r *Repository) GetLocalArtists() ([]model.LocalArtist, error) {
	var artists []model.LocalArtist
	err := r.db.Order("name asc").Find(&artists).Error
	return artists, err
}

// Album
func (r *Repository) GetLocalAlbums() ([]model.LocalAlbum, error) {
	var albums []model.LocalAlbum
	err := r.db.Preload("Artist").Order("title asc").Find(&albums).Error
	return albums, err
}

// Song
func (r *Repository) CreateLocalSong(song *model.LocalSong) error {
	return r.db.Create(song).Error
}

func (r *Repository) GetLocalSongs(page, pageSize int) ([]model.LocalSong, int64, error) {
	var songs []model.LocalSong
	var total int64
	r.db.Model(&model.LocalSong{}).Count(&total)
	offset := (page - 1) * pageSize
	err := r.db.Preload("Artist").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&songs).Error
	return songs, total, err
}

func (r *Repository) GetLocalSongsByArtist(artistName string, page, pageSize int) ([]model.LocalSong, int64, error) {
	var songs []model.LocalSong
	var total int64
	q := r.db.Model(&model.LocalSong{}).Where("artist_name = ?", artistName)
	q.Count(&total)
	offset := (page - 1) * pageSize
	err := q.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&songs).Error
	return songs, total, err
}

func (r *Repository) GetLocalSongByHash(hash string) (*model.LocalSong, error) {
	var song model.LocalSong
	err := r.db.Where("file_hash = ?", hash).First(&song).Error
	return &song, err
}

func (r *Repository) GetLocalSong(id string) (*model.LocalSong, error) {
	var song model.LocalSong
	err := r.db.First(&song, "id = ?", id).Error
	return &song, err
}

func (r *Repository) UpdateLocalSong(song *model.LocalSong) error {
	return r.db.Save(song).Error
}

func (r *Repository) DeleteLocalSong(id string) error {
	return r.db.Delete(&model.LocalSong{}, "id = ?", id).Error
}

func (r *Repository) IncrementLocalSongPlayCount(id string) error {
	return r.db.Model(&model.LocalSong{}).Where("id = ?", id).
		UpdateColumn("play_count", gorm.Expr("play_count + ?", 1)).Error
}

func (r *Repository) ToggleLocalSongFavorite(id string) (bool, error) {
	var song model.LocalSong
	err := r.db.First(&song, "id = ?", id).Error
	if err != nil {
		return false, err
	}
	song.Favorite = !song.Favorite
	err = r.db.Save(&song).Error
	return song.Favorite, err
}

// Playlist
func (r *Repository) GetLocalPlaylists() ([]model.LocalPlaylist, error) {
	var playlists []model.LocalPlaylist
	err := r.db.Order("created_at desc").Find(&playlists).Error
	return playlists, err
}

func (r *Repository) CreateLocalPlaylist(playlist *model.LocalPlaylist) error {
	return r.db.Create(playlist).Error
}

func (r *Repository) DeleteLocalPlaylist(id string) error {
	return r.db.Delete(&model.LocalPlaylist{}, "id = ?", id).Error
}

func (r *Repository) GetLocalPlaylistSongs(playlistID string) ([]model.LocalSong, error) {
	var songs []model.LocalSong
	err := r.db.Raw(`
		SELECT s.* FROM local_songs s
		JOIN local_playlist_songs ps ON ps.song_id = s.id
		WHERE ps.playlist_id = ?
		ORDER BY ps.position ASC
	`, playlistID).Scan(&songs).Error
	return songs, err
}

func (r *Repository) AddSongToPlaylist(playlistID, songID string) error {
	var count int64
	r.db.Model(&model.LocalPlaylistSong{}).Where("playlist_id = ?", playlistID).Count(&count)
	ps := model.LocalPlaylistSong{
		ID: fmt.Sprintf("%s-%s", playlistID, songID),
		PlaylistID: playlistID,
		SongID: songID,
		Position: int(count),
	}
	return r.db.FirstOrCreate(&ps, model.LocalPlaylistSong{PlaylistID: playlistID, SongID: songID}).Error
}

func (r *Repository) RemoveSongFromPlaylist(playlistID, songID string) error {
	return r.db.Delete(&model.LocalPlaylistSong{}, "playlist_id = ? AND song_id = ?", playlistID, songID).Error
}
