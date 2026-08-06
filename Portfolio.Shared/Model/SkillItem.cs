namespace Portfolio.Shared.Model;

public class SkillItem
{
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// CosmosDBのPartitionKeyに使うので、必ず小文字で入れる。
    /// </summary>
    public string PartitionKey { get; set; } = string.Empty;

    /// <summary>
    /// システム開発業務か、デザイン業務か
    /// </summary>
    public string Category { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 1～5の整数値で評価する。
    /// </summary>
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    /// <summary>
    /// サイトでの表示順序を指定するための値。小さいほど先に表示される。
    /// </summary>
    public int SortOrder { get; set; }
}
