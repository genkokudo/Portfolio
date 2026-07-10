using System;
using System.Collections.Generic;
using System.Text;

namespace Portfolio.Shared.Model
{
    public class PortfolioData
    {
        public List<SkillItem> Skills { get; set; } = new();
        public List<WorkHistoryItem> WorkHistories { get; set; } = new();
        public List<WorkItem> Works { get; set; } = new();
    }
}
