namespace Portfolio.Shared.Model;

public class PortfolioData
{
    public string AuthorNameKanji { get; set; } = string.Empty;
    public string AuthorNameHiragana { get; set; } = string.Empty;
    public string AuthorNameAlphabet { get; set; } = string.Empty;

    public string ProfileImageUrl { get; set; } = string.Empty;
    public string ProfessionalTitle { get; set; } = string.Empty;
    public string HeroTitle { get; set; } = string.Empty;
    public string HeroDescription { get; set; } = string.Empty;
    public string ProfileDescription { get; set; } = string.Empty;
    public string GitHubUrl { get; set; } = string.Empty;
    public List<string> ProfileTags { get; set; } = [];

    public List<SkillItem> Skills { get; set; } = [];
    public List<WorkHistoryItem> WorkHistories { get; set; } = [];
    public List<WorkItem> Works { get; set; } = [];
    public ContactSettings Contact { get; set; } = new();
}
