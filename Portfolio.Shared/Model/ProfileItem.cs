using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Portfolio.Shared.Model
{
    public class ProfileItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
        [JsonPropertyName("authorNameKanji")]
        public string AuthorNameKanji { get; set; } = string.Empty;
        [JsonPropertyName("authorNameHiragana")]
        public string AuthorNameHiragana { get; set; } = string.Empty;
        [JsonPropertyName("authorNameAlphabet")]
        public string AuthorNameAlphabet { get; set; } = string.Empty;
        [JsonPropertyName("profileImageUrl")]
        public string ProfileImageUrl { get; set; } = string.Empty;
        [JsonPropertyName("professionalTitle")]
        public string ProfessionalTitle { get; set; } = string.Empty;
        [JsonPropertyName("profileDescription")]
        public string ProfileDescription { get; set; } = string.Empty;
        [JsonPropertyName("gitHubUrl")]
        public string GitHubUrl { get; set; } = string.Empty;
        [JsonPropertyName("profileTags")]
        public List<string> ProfileTags { get; set; } = new();
    }
}
