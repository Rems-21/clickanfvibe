import re

with open('src/pages/Generating.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_polling = """          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await fetch(`/api/generate/status/${taskId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'ngrok-skip-browser-warning': '69420'
                }
              });
              
              const statusData = await statusRes.json();
              
              if (statusRes.ok && statusData.status === 'success') {
                const newAudios = statusData.versions.map((track, index) => ({ 
                  id: index === 0 ? 'A' : 'B', 
                  url: track.url,
                  image_url: track.image_url,
                  lyrics: track.lyrics,
                  title: track.title && track.title.trim() !== "" ? track.title : `Création ${style} (Version ${index + 1})`
                }));
                setGeneratedAudios(newAudios);
                await refreshCredits(); // Deduct credits
                
                clearInterval(interval);
                clearInterval(pollInterval);
                setProgress(100);
                setIsFinished(true);

                // Sauvegarder automatiquement en arrière-plan sans bloquer l'UI
                Promise.all(newAudios.map(async (track) => {
                  if (track.url) {
                    try {
                      const payload = {
                        title: track.title,
                        prompt: prompt,
                        style: style,
                        mood: mood,
                        duration_str: duration,
                        audio_url: track.url,
                        cover_url: track.image_url || '',
                        lyrics: track.lyrics || ''
                      };
                      await fetch(`/api/music/save`, {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                      });
                    } catch (e) {
                      console.error("Erreur de sauvegarde automatique :", e);
                    }
                  }
                }));
              } else if (statusData.status === 'error') {
                clearInterval(interval);
                clearInterval(pollInterval);
                setGenerationError(statusData.detail || "Erreur lors de la génération avec l'API Suno.");
              }
              // If pending, we just continue looping
            } catch (err) {
              console.error("Polling error:", err);
            }
          }, 5000); // Poll every 5 seconds
          
          // Cleanup this interval specifically on unmount if needed
          window.__currentPollInterval = pollInterval;"""

new_polling = """          let isPolling = true;
          const poll = async () => {
            if (!isPolling) return;
            try {
              const statusRes = await fetch(`/api/generate/status/${taskId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'ngrok-skip-browser-warning': '69420'
                }
              });
              
              const statusData = await statusRes.json();
              
              if (statusRes.ok && statusData.status === 'success') {
                isPolling = false;
                const newAudios = statusData.versions.map((track, index) => ({ 
                  id: index === 0 ? 'A' : 'B', 
                  url: track.url,
                  image_url: track.image_url,
                  lyrics: track.lyrics,
                  title: track.title && track.title.trim() !== "" ? track.title : `Création ${style} (Version ${index + 1})`
                }));
                setGeneratedAudios(newAudios);
                await refreshCredits(); // Deduct credits
                
                clearInterval(interval);
                setProgress(100);
                setIsFinished(true);

                // Sauvegarder automatiquement en arrière-plan sans bloquer l'UI
                Promise.all(newAudios.map(async (track) => {
                  if (track.url) {
                    try {
                      const payload = {
                        title: track.title,
                        prompt: prompt,
                        style: style,
                        mood: mood,
                        duration_str: duration,
                        audio_url: track.url,
                        cover_url: track.image_url || '',
                        lyrics: track.lyrics || ''
                      };
                      await fetch(`/api/music/save`, {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                      });
                    } catch (e) {
                      console.error("Erreur de sauvegarde automatique :", e);
                    }
                  }
                }));
              } else if (statusData.status === 'error') {
                isPolling = false;
                clearInterval(interval);
                setGenerationError(statusData.detail || "Erreur lors de la génération avec l'API Suno.");
              } else {
                if (isPolling) setTimeout(poll, 5000);
              }
            } catch (err) {
              console.error("Polling error:", err);
              if (isPolling) setTimeout(poll, 5000);
            }
          };
          setTimeout(poll, 5000); // Start polling after 5 seconds
          
          window.__stopPolling = () => { isPolling = false; };"""

if old_polling in content:
    content = content.replace(old_polling, new_polling)
    with open('src/pages/Generating.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Generating.jsx patched successfully.")
else:
    print("Could not find old polling logic in Generating.jsx!")
