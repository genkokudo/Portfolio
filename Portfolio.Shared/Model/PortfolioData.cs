using System;
using System.Collections.Generic;
using System.Text;

namespace Portfolio.Shared.Model
{
    public class PortfolioData
    {
        public string AuthorNameKanji { get; set; } = string.Empty;
        public string AuthorNameHiragana { get; set; } = string.Empty;
        public string AuthorNameAlphabet { get; set; } = string.Empty;
        public List<SkillItem> Skills { get; set; } = [];
        public List<WorkHistoryItem> WorkHistories { get; set; } = [];
        public List<WorkItem> Works { get; set; } = [];
    }
}
