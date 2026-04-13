package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        string     `gorm:"type:varchar(36);primaryKey" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `gorm:"index" json:"-"`
}

func (b *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}

type Project struct {
	BaseModel
	Name        string `gorm:"type:varchar(200);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	O3icsCount  int    `gorm:"default:0" json:"o3ics_count"`
}

type O3ics struct {
	BaseModel
	ProjectID    string   `gorm:"type:varchar(36)" json:"project_id"`
	Project      Project  `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Title        string   `gorm:"type:varchar(200)" json:"title"`
	Content      string   `gorm:"type:text;not null" json:"content"`
	Emotion      string   `gorm:"type:varchar(50)" json:"emotion"`
	Theme        string   `gorm:"type:varchar(50)" json:"theme"`
	Style        string   `gorm:"type:varchar(50)" json:"style"`
	Rhyme        string   `gorm:"type:varchar(50)" json:"rhyme"`
	Length       string   `gorm:"type:varchar(50)" json:"length"`
	SunoPrompts  string   `gorm:"type:text" json:"suno_prompts"`
	DiceResult   string   `gorm:"type:text" json:"dice_result"`
	OriginalText string   `gorm:"type:text" json:"original_text"`
	Favorite     bool     `gorm:"default:false" json:"favorite"`
}

type Rule struct {
	BaseModel
	Name        string `gorm:"type:varchar(200);not null" json:"name"`
	Type        string `gorm:"type:varchar(50);not null" json:"type"`
	Author      string `gorm:"type:varchar(100)" json:"author"`
	Version     string `gorm:"type:varchar(20)" json:"version"`
	Tags        string `gorm:"type:text" json:"tags"`
	Description string `gorm:"type:text" json:"description"`
	Config      string `gorm:"type:text;not null" json:"config"`
	Priority    int    `gorm:"default:5" json:"priority"`
	IsActive    bool   `gorm:"default:true" json:"is_active"`
	IsPublic    bool   `gorm:"default:false" json:"is_public"`
	LikeCount   int    `gorm:"default:0" json:"like_count"`
	UseCount    int    `gorm:"default:0" json:"use_count"`
}

type GenerateParams struct {
	Emotion string `json:"emotion"`
	Theme   string `json:"theme"`
	Style   string `json:"style"`
	Rhyme   string `json:"rhyme"`
	Length  string `json:"length"`
}

type GenerateRequest struct {
	Content     string          `json:"content" binding:"required"`
	ProjectID   string          `json:"project_id"`
	Params      GenerateParams  `json:"params" binding:"required"`
	UseRules    bool            `json:"use_rules"`
	UseDice     bool            `json:"use_dice"`
	CharacterID string          `json:"character_id"`
}

type GenerateResponse struct {
	O3ics        string       `json:"o3ics"`
	SunoPrompts  []string     `json:"suno_prompts"`
	DiceResult   DiceResult   `json:"dice_result"`
	Metadata     Metadata     `json:"metadata"`
}

type DiceResult struct {
	ClosingStyle        string `json:"closing_style"`
	TurningPoint        string `json:"turning_point"`
	Perspective         string `json:"perspective"`
	Rhetoric            string `json:"rhetoric"`
	LineLengthVariation string `json:"line_length_variation"`
}

type Metadata struct {
	Model            string `json:"model"`
	TokensUsed       int    `json:"tokens_used"`
	GenerationTimeMs int    `json:"generation_time_ms"`
}

type MusicTrack struct {
	BaseModel
	O3icsID       string `gorm:"type:varchar(36)" json:"o3ics_id"`
	TaskID        string `gorm:"type:varchar(100)" json:"task_id"`
	SunoSongID    string `gorm:"type:varchar(100)" json:"suno_song_id"`
	Title         string `gorm:"type:varchar(200);not null" json:"title"`
	AudioURL      string `gorm:"type:text" json:"audio_url"`
	VideoURL      string `gorm:"type:text" json:"video_url"`
	CoverImageURL string `gorm:"type:text" json:"cover_image_url"`
	Status        string `gorm:"type:varchar(50);default:pending" json:"status"`
	FailReason    string `gorm:"type:text" json:"fail_reason"`
	Style         string `gorm:"type:varchar(100)" json:"style"`
	Model         string `gorm:"type:varchar(50)" json:"model"`
	Instrumental  bool   `gorm:"default:false" json:"instrumental"`
}

type ApiLog struct {
	BaseModel
	Model  string  `gorm:"type:varchar(50);not null" json:"model"`
	Input  string  `gorm:"type:text;not null" json:"input"`
	Output string  `gorm:"type:text;not null" json:"output"`
	Tokens int     `gorm:"default:0" json:"tokens"`
	Cost   float64 `gorm:"default:0" json:"cost"`
	Status string  `gorm:"type:varchar(50);not null" json:"status"`
}

type SunoSubmitParams struct {
	GptDescriptionPrompt string `json:"gpt_description_prompt"`
	MakeInstrumental     bool   `json:"make_instrumental"`
	Model               string `json:"model"`
	O3ics               string `json:"o3ics,omitempty"`
	Title               string `json:"title,omitempty"`
	NotifyHook          string `json:"notify_hook,omitempty"`
}

type SunoSubmitResponse struct {
	TaskID string `json:"task_id"`
}

type SunoSong struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	AudioURL string `json:"audio_url"`
	VideoURL string `json:"video_url"`
	ImageURL string `json:"image_url"`
	Lyrics   string `json:"o3ics"`
}

type SunoTask struct {
	TaskID     string   `json:"task_id"`
	Action     string   `json:"action"`
	Status     string   `json:"status"`
	SubmitTime int64    `json:"submitTime"`
	StartTime  int64    `json:"startTime"`
	FinishTime int64    `json:"finishTime"`
	FailReason string   `json:"fail_reason"`
	Data       SunoData `json:"data"`
}

type SunoData struct {
	Songs  []SunoSong `json:"songs,omitempty"`
	Lyrics string     `json:"o3ics,omitempty"`
}

type SunoFetchResponse struct {
	Tasks []SunoTask `json:"tasks"`
}

// ============ LocalLibrary Models (方案B/C) ============

type LocalArtist struct {
	BaseModel
	Name        string `gorm:"type:varchar(200);not null;unique" json:"name"`
	CoverPath   string `gorm:"type:text" json:"cover_path"`
	Description string `gorm:"type:text" json:"description"`
}

type LocalAlbum struct {
	BaseModel
	Title      string `gorm:"type:varchar(200);not null" json:"title"`
	ArtistID   string `gorm:"type:varchar(36)" json:"artist_id"`
	Artist     *LocalArtist `gorm:"foreignKey:ArtistID" json:"artist,omitempty"`
	CoverPath  string `gorm:"type:text" json:"cover_path"`
	Year       int    `json:"year"`
	Genre      string `gorm:"type:varchar(100)" json:"genre"`
}

type LocalSong struct {
	BaseModel
	Title       string `gorm:"type:varchar(200);not null" json:"title"`
	ArtistName  string `gorm:"type:varchar(200)" json:"artist_name"`
	AlbumName   string `gorm:"type:varchar(200)" json:"album_name"`
	Genre       string `gorm:"type:varchar(100)" json:"genre"`
	Year        int    `json:"year"`
	Duration    int    `gorm:"default:0" json:"duration"`
	TrackNumber int    `json:"track_number"`

	// 文件路径
	AudioPath  string `gorm:"type:text" json:"audio_path"`
	CoverPath  string `gorm:"type:text" json:"cover_path"`
	LrcPath    string `gorm:"type:text" json:"lrc_path"`
	Lrc        string `gorm:"type:text" json:"lrc"`

	// 播放信息
	PlayCount  int  `gorm:"default:0" json:"play_count"`
	Favorite   bool `gorm:"default:false" json:"favorite"`
	FileHash   string `gorm:"type:varchar(64);unique" json:"file_hash"`

	// 关联
	ArtistID   string      `gorm:"type:varchar(36)" json:"artist_id"`
	Artist     *LocalArtist `gorm:"foreignKey:ArtistID" json:"artist,omitempty"`
	AlbumID    string      `gorm:"type:varchar(36)" json:"album_id"`
	Album      *LocalAlbum  `gorm:"foreignKey:AlbumID" json:"album,omitempty"`
}

type LocalPlaylist struct {
	BaseModel
	Name        string `gorm:"type:varchar(200);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	CoverPath   string `gorm:"type:text" json:"cover_path"`
}

type LocalPlaylistSong struct {
	ID          string `gorm:"type:varchar(36);primaryKey" json:"id"`
	PlaylistID  string `gorm:"type:varchar(36);not null" json:"playlist_id"`
	SongID      string `gorm:"type:varchar(36);not null" json:"song_id"`
	Position    int    `gorm:"default:0" json:"position"`
}
