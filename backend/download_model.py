import os
from huggingface_hub import snapshot_download

print("Reprise du téléchargement du modèle MusicGen-Small...")
try:
    # resume_download=True permet de reprendre un téléchargement interrompu
    path = snapshot_download(
        repo_id="facebook/musicgen-small",
        resume_download=True,
        local_files_only=False
    )
    print(f"\nTéléchargement terminé avec succès !")
    print(f"Le modèle se trouve dans le cache HuggingFace : {path}")
    print("Tu peux maintenant relancer ton backend (main.py), il utilisera cette version téléchargée.")
except Exception as e:
    print(f"\nUne erreur est survenue lors du téléchargement : {e}")
