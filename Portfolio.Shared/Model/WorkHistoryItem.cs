using System.Text.Json.Serialization;

namespace Portfolio.Shared.Model
{
    public class WorkHistoryItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// CosmosDBのPartitionKeyに使うので、必ず小文字で入れる。
        /// </summary>
        [JsonPropertyName("partitionKey")]
        public string PartitionKey { get; set; } = string.Empty;

        /// <summary>
        /// 会社の種別
        /// </summary>
        [JsonPropertyName("companyType")]
        public string CompanyType { get; set; } = string.Empty;

        /// <summary>
        /// 役職・担当
        /// </summary>
        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("startDate")]
        public string StartDate { get; set; } = string.Empty;

        [JsonPropertyName("endDate")]
        public string EndDate { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// サイトでの表示順序を指定するための値。小さいほど先に表示される。
        /// </summary>
        [JsonPropertyName("sortOrder")]
        public int SortOrder { get; set; }
    }
}
