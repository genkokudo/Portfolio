using System.Text.Json.Serialization;
namespace Portfolio.Shared.Model;

public class WorkHistoryItem
{
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// CosmosDBのPartitionKeyに使うので、必ず小文字で入れる。
    /// </summary>
    public string PartitionKey { get; set; } = string.Empty;

    /// <summary>
    /// 会社の種別
    /// </summary>
    public string CompanyType { get; set; } = string.Empty;

    /// <summary>
    /// 役職・担当
    /// </summary>
    public string Role { get; set; } = string.Empty;

    public string StartDate { get; set; } = string.Empty;

    public string EndDate { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// サイトでの表示順序を指定するための値。小さいほど先に表示される。
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// 経験した社内プロジェクトのリスト
    /// </summary>
    public List<CareerProjectItem> Projects { get; set; } = [];
}

/// <summary>
/// 社内プロジェクト
/// </summary>
public class CareerProjectItem
{
    public string Title { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Overview { get; set; } = string.Empty;
    public string RoleAndScale { get; set; } = string.Empty;
    public List<string> Phases { get; set; } = [];
    public List<string> Technologies { get; set; } = [];
    public List<string> Contributions { get; set; } = [];
}