import re

with open('src/pages/Generating.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useAudio import and context usage
content = re.sub(
    r'const { user, refreshCredits } = useAuth\(\);',
    'const { user, refreshCredits } = useAuth();\n  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();',
    content
)

if 'useAudio' not in content[:500]:
    content = re.sub(
        r'import \{ useAuth \} from \'../context/AuthContext\';',
        'import { useAuth } from \'../context/AuthContext\';\nimport { useAudio } from \'../context/AudioContext\';',
        content
    )

# 2. Fix Version 1 play button and remove native audio
v1_old = """                  <div className="version-play-btn pink-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[0]?.url) new Audio(generatedAudios[0].url).play();
                  }}>
                    <Play size={20} fill="currentColor" />
                  </div>"""

v1_new = """                  <div className="version-play-btn pink-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[0]?.url) playTrack({ ...generatedAudios[0], title: 'Version 1', style, mood });
                  }}>
                    {currentTrack?.url === generatedAudios[0]?.url && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </div>"""

content = content.replace(v1_old, v1_new)
content = re.sub(
    r'<audio controls src=\{generatedAudios\[0\]\.url\} style=\{\{ width: \'100%\', height: \'40px\', borderRadius: \'8px\', outline: \'none\' \}\}></audio>',
    '<div className="waveform-mock"></div>',
    content
)

# 3. Fix Version 2 play button and remove native audio
v2_old = """                  <div className="version-play-btn purple-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[1]?.url) new Audio(generatedAudios[1].url).play();
                  }}>
                    <Play size={20} fill="currentColor" />
                  </div>"""

v2_new = """                  <div className="version-play-btn purple-gradient" onClick={(e) => {
                    e.stopPropagation();
                    if (generatedAudios[1]?.url) playTrack({ ...generatedAudios[1], title: 'Version 2', style, mood });
                  }}>
                    {currentTrack?.url === generatedAudios[1]?.url && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </div>"""

content = content.replace(v2_old, v2_new)
content = re.sub(
    r'<audio controls src=\{generatedAudios\[1\]\.url\} style=\{\{ width: \'100%\', height: \'40px\', borderRadius: \'8px\', outline: \'none\' \}\}></audio>',
    '<div className="waveform-mock alt"></div>',
    content
)

with open('src/pages/Generating.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Generating.jsx patched successfully.")
