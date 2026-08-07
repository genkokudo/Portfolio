namespace Portfolio.Shared.Model;

/// <summary>
/// お問い合わせ機能の表示設定。
/// </summary>
public class ContactSettings
{
    /// <summary>
    /// お問い合わせを受け付けているかどうか。
    /// </summary>
    public bool IsEnabled { get; set; }

    /// <summary>
    /// お問い合わせ停止中に表示するメッセージ。
    /// </summary>
    public string UnavailableMessage { get; set; } = string.Empty;
}
