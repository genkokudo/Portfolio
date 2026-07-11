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

    public class WorkItem
    {
        /// <summary>
        /// Cosmos DBのパーティションキー的にも要る一意な識別子
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// 作品のカテゴリ
        /// </summary>
        [JsonPropertyName("category")]
        public WorkCategory Category { get; set; } = WorkCategory.Unknown;

        /// <summary>
        /// 一覧・詳細に表示する作品名
        /// </summary>
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// 作品の説明文
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 作品のサムネイル画像のURL
        /// </summary>
        [JsonPropertyName("thumbnailUrl")]
        public string ThumbnailUrl { get; set; } = string.Empty;

        /// <summary>
        /// 作品のフルサイズ画像のURL
        /// </summary>
        [JsonPropertyName("fullImageUrl")]
        public string FullImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// 作品の制作に使用したツールのリスト
        /// </summary>
        [JsonPropertyName("toolsUsed")]
        public List<string> ToolsUsed { get; set; } = new();

        /// <summary>
        /// 作品の制作日
        /// </summary>
        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// サイトでの表示順序を指定するための値。小さいほど先に表示される。
        /// </summary>
        [JsonPropertyName("sortOrder")]
        public int SortOrder { get; set; }

        /// <summary>
        /// 作品が公開されているかどうかを示すフラグ
        /// </summary>
        [JsonPropertyName("isPublished")]
        public bool IsPublished { get; set; }
    }
}
