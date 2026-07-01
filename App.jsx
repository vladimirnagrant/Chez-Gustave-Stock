Je dois passer ces fonctions depuis le composant principal jusqu'à `EmployeeView` :

Maintenant je mets à jour la signature de `EmployeeView` et le `PanierCommun` call :

Maintenant je réécris `PanierCommun` pour ajouter modifier/supprimer sur chaque article :

Maintenant je mets à jour le rendu de chaque article dans `PanierCommun` :

Voilà ! Dans le **Panier commun**, chaque article a maintenant :

- **✏️** → modifie la quantité avec boutons +/− directement dans la ligne, confirme avec ✓
- **🗑️** → supprime la demande avec confirmation (fenêtre de sécurité)
- **💬** → commentaire comme avant

Accessible à tout le monde — employés, chef d'équipe et manager.

Pour mettre à jour sur Vercel, remplace juste le fichier **App.jsx** sur GitHub avec ce nouveau fichier, et Vercel redéploiera automatiquement !
