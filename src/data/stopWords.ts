export const STOP_WORDS = new Set([
  // English
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'was', 'are', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'just',
  'than', 'then', 'that', 'this', 'these', 'those', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her', 'they', 'their',
  'them', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
  'each', 'more', 'also', 'up', 'out', 'if', 'about', 'into', 'through',
  'as', 'am', 'us', 'him', 'now', 'too', 'very', 'much', 'like',
  'get', 'got', 'go', 'im', 'ur', 'u', 'r', 'ok', 'okay', 'yeah', 'yes',
  'no', 'oh', 'ah', 'lol', 'omg', 'idk', 'nah', 'yep', 'hmm', 'ugh',

  // Roman Urdu filler words
  'hai', 'tha', 'thi', 'hain', 'toh', 'bhi', 'ko', 'ke', 'ki', 'ka',
  'se', 'ne', 'pe', 'par', 'mein', 'main', 'aur', 'nahi', 'nah', 'na',
  'han', 'haan', 'kya', 'wo', 'woh', 'yeh', 'ye', 'ho', 'hy', 'ha',
  'rha', 'rhi', 'rhe', 'kr', 'kar', 'karo', 'karna', 'ab', 'bas',
  'ek', 'ak', 'sb', 'sab', 'mujhe', 'muje', 'mere', 'mera', 'meri',
  'tera', 'teri', 'tere', 'ap', 'aap', 'unka', 'unki', 'unke',
  'phir', 'fir', 'wala', 'wali', 'wale', 'koi', 'kuch', 'kyun',
  'kyunke', 'lekin', 'magar', 'agr', 'agar', 'tum', 'tu', 'hum',
  'yar', 'yaar', 'bhai', 'bro', 'hn', 'hna', 'mn', 'nh', 'nhi',
  'nhii', 'hoo', 'hun', 'hua', 'hui', 'hue', 'th', 'rh', 'lg',
  'lag', 'lga', 'wo', 'jo', 'jab', 'tab', 'idhr', 'udhr', 'wahan',
  'yahan', 'sy', 'ky', 'hy', 'py', 'ly', 'dy', 'ny',
]);