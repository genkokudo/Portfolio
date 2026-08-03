using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Portfolio.Shared.Model
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum WorkCategory
    {
        Unknown = 0,
        Flyer = 1,
        Banner = 2
    }
    public enum WorkProductionType
    {
        Unknown,
        /// <summary>
        /// 職業訓練課題
        /// </summary>
        TrainingAssignment,
        /// <summary>
        /// 自主制作
        /// </summary>
        PersonalProject,
        /// <summary>
        /// 実際のクライアントから依頼された案件。
        /// </summary>
        ClientWork
    }

    public class WorkItem
    {
        /// <summary>
        /// Cosmos DB内で作品を識別する一意なID。
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// 作品のカテゴリ（不明・バナー・フライヤー）。
        /// </summary>
        [JsonPropertyName("category")]
        public WorkCategory Category { get; set; } = WorkCategory.Unknown;

        /// <summary>
        /// 制作区分（職業訓練課題・自主制作・実案件）。
        /// </summary>
        [JsonPropertyName("productionType")]
        public WorkProductionType ProductionType { get; set; } = WorkProductionType.Unknown;

        /// <summary>
        /// 一覧・詳細に表示する作品名。
        /// </summary>
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// 一覧カードに表示する短い説明文。
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 作品のサイズ。例：1080 × 1080 px、A4。
        /// </summary>
        [JsonPropertyName("size")]
        public string Size { get; set; } = string.Empty;

        /// <summary>
        /// 制作に要した期間。例：約2日、約1週間。
        /// </summary>
        [JsonPropertyName("productionPeriod")]
        public string ProductionPeriod { get; set; } = string.Empty;

        /// <summary>
        /// 制作目的。何を伝え、どのような行動につなげるか。
        /// </summary>
        [JsonPropertyName("purpose")]
        public string Purpose { get; set; } = string.Empty;

        /// <summary>
        /// 想定するターゲット。
        /// </summary>
        [JsonPropertyName("targetAudience")]
        public string TargetAudience { get; set; } = string.Empty;

        /// <summary>
        /// 制作時の条件や、解決すべき課題。
        /// </summary>
        [JsonPropertyName("requirements")]
        public string Requirements { get; set; } = string.Empty;

        /// <summary>
        /// デザイン全体のコンセプト。
        /// </summary>
        [JsonPropertyName("concept")]
        public string Concept { get; set; } = string.Empty;

        /// <summary>
        /// 配色・レイアウト・視線誘導など、デザイン上の工夫。
        /// </summary>
        [JsonPropertyName("designPoints")]
        public List<string> DesignPoints { get; set; } = new();

        /// <summary>
        /// 企画・コピー・素材選定・画像加工など、自分が担当した範囲。
        /// </summary>
        [JsonPropertyName("responsibilities")]
        public List<string> Responsibilities { get; set; } = new();

        /// <summary>
        /// 制作を通じて得たことや、今後改善したい点。
        /// </summary>
        [JsonPropertyName("reflection")]
        public string Reflection { get; set; } = string.Empty;

        /// <summary>
        /// 作品のサムネイル画像URL。
        /// </summary>
        [JsonPropertyName("thumbnailUrl")]
        public string ThumbnailUrl { get; set; } = string.Empty;

        /// <summary>
        /// 作品のフルサイズ画像URL。
        /// </summary>
        [JsonPropertyName("fullImageUrl")]
        public string FullImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// 作品の制作に使用したツール。
        /// </summary>
        [JsonPropertyName("toolsUsed")]
        public List<string> ToolsUsed { get; set; } = new();

        /// <summary>
        /// 作品の制作日。
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// サイトでの表示順序。小さいほど先に表示される。
        /// </summary>
        [JsonPropertyName("sortOrder")]
        public int SortOrder { get; set; }

        /// <summary>
        /// 作品を公開するかどうか。
        /// </summary>
        [JsonPropertyName("isPublished")]
        public bool IsPublished { get; set; }
    }
}
