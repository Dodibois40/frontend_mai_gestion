import api from './api';

class OptiCoupeService {
  constructor() {
    this.isOfflineMode = false;
    this.localStorageKey = 'opti-coupe-data';
    this.initializeLocalData();
  }

  // Initialiser les données locales si elles n'existent pas
  initializeLocalData() {
    const existingData = localStorage.getItem(this.localStorageKey);
    if (!existingData) {
      const initialData = {
        projects: [],
        panels: [
          {
            id: 1,
            material: 'Contreplaqué Bouleau',
            width: 2500,
            height: 1250,
            thickness: 18,
            pricePerM2: 45.50,
            stock: 12,
            grainDirection: 'HORIZONTAL',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            material: 'MDF',
            width: 2440,
            height: 1220,
            thickness: 19,
            pricePerM2: 28.90,
            stock: 8,
            grainDirection: 'NONE',
            createdAt: new Date().toISOString()
          }
        ],
        nextProjectId: 1,
        nextPanelId: 3
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(initialData));
    }
  }

  // Récupérer les données locales
  getLocalData() {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : null;
  }

  // Sauvegarder les données locales
  saveLocalData(data) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  // Vérifier si on doit utiliser le mode offline
  async checkApiConnection() {
    try {
      const response = await api.get('/opti-coupe/panels', { timeout: 3000 });
      this.isOfflineMode = false;
      return true;
    } catch (error) {
      console.warn('API indisponible, basculement en mode autonome');
      this.isOfflineMode = true;
      return false;
    }
  }
  
  // ===== GESTION DES PANNEAUX =====
  
  async getPanels() {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      return data.panels;
    }
    
    try {
      const response = await api.get('/opti-coupe/panels');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des panneaux:', error);
      // Fallback vers les données locales
      const data = this.getLocalData();
      return data.panels;
    }
  }

  async createPanel(panel) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const newPanel = {
        ...panel,
        id: data.nextPanelId++,
        createdAt: new Date().toISOString()
      };
      data.panels.push(newPanel);
      this.saveLocalData(data);
      return newPanel;
    }
    
    try {
      const response = await api.post('/opti-coupe/panels', panel);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du panneau:', error);
      // Fallback vers le stockage local
      const data = this.getLocalData();
      const newPanel = {
        ...panel,
        id: data.nextPanelId++,
        createdAt: new Date().toISOString()
      };
      data.panels.push(newPanel);
      this.saveLocalData(data);
      return newPanel;
    }
  }

  async updatePanel(id, panel) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const index = data.panels.findIndex(p => p.id === id);
      if (index !== -1) {
        data.panels[index] = { ...data.panels[index], ...panel };
        this.saveLocalData(data);
        return data.panels[index];
      }
      throw new Error('Panneau non trouvé');
    }
    
    try {
      const response = await api.patch(`/opti-coupe/panels/${id}`, panel);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panneau:', error);
      throw error;
    }
  }

  async deletePanel(id) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      data.panels = data.panels.filter(p => p.id !== id);
      this.saveLocalData(data);
      return;
    }
    
    try {
      await api.delete(`/opti-coupe/panels/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du panneau:', error);
      throw error;
    }
  }

  async updatePanelStock(id, quantity, operation) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const panel = data.panels.find(p => p.id === id);
      if (panel) {
        if (operation === 'add') {
          panel.stock += quantity;
        } else if (operation === 'subtract') {
          panel.stock = Math.max(0, panel.stock - quantity);
        } else if (operation === 'set') {
          panel.stock = quantity;
        }
        this.saveLocalData(data);
        return panel;
      }
      throw new Error('Panneau non trouvé');
    }
    
    try {
      const response = await api.post(`/opti-coupe/panels/${id}/stock`, {
        quantity,
        operation
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      throw error;
    }
  }

  async getMaterials() {
    const data = this.getLocalData();
    const uniqueMaterials = [...new Set(data.panels.map(p => p.material))];
    return uniqueMaterials;
  }

  // ===== GESTION DES PROJETS =====
  
  async getProjects() {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      return data.projects;
    }
    
    try {
      const response = await api.get('/opti-coupe/projects');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      // Fallback vers les données locales
      const data = this.getLocalData();
      return data.projects;
    }
  }

  async createProject(project) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const newProject = {
        ...project,
        id: data.nextProjectId++,
        status: 'active',
        pieces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.projects.push(newProject);
      this.saveLocalData(data);
      return newProject;
    }
    
    try {
      const response = await api.post('/opti-coupe/projects', project);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      // Fallback vers le stockage local
      const data = this.getLocalData();
      const newProject = {
        ...project,
        id: data.nextProjectId++,
        status: 'active',
        pieces: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.projects.push(newProject);
      this.saveLocalData(data);
      return newProject;
    }
  }

  async getProject(id) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const project = data.projects.find(p => p.id === id);
      if (!project) throw new Error('Projet non trouvé');
      return project;
    }
    
    try {
      const response = await api.get(`/opti-coupe/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      throw error;
    }
  }

  async updateProject(id, project) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      const index = data.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        data.projects[index] = { 
          ...data.projects[index], 
          ...project,
          updatedAt: new Date().toISOString()
        };
        this.saveLocalData(data);
        return data.projects[index];
      }
      throw new Error('Projet non trouvé');
    }
    
    try {
      const response = await api.patch(`/opti-coupe/projects/${id}`, project);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }
  }

  async deleteProject(id) {
    await this.checkApiConnection();
    
    if (this.isOfflineMode) {
      const data = this.getLocalData();
      data.projects = data.projects.filter(p => p.id !== id);
      this.saveLocalData(data);
      return;
    }
    
    try {
      await api.delete(`/opti-coupe/projects/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  }

  async addPiece(projectId, piece) {
    try {
      const response = await api.post(`/opti-coupe/projects/${projectId}/pieces`, piece);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce:', error);
      throw error;
    }
  }

  async updatePiece(projectId, pieceId, piece) {
    try {
      const response = await api.patch(`/opti-coupe/projects/${projectId}/pieces/${pieceId}`, piece);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la pièce:', error);
      throw error;
    }
  }

  async deletePiece(projectId, pieceId) {
    try {
      await api.delete(`/opti-coupe/projects/${projectId}/pieces/${pieceId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce:', error);
      throw error;
    }
  }

  async getProjectSummary(id) {
    try {
      const response = await api.get(`/opti-coupe/projects/${id}/summary`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      throw error;
    }
  }

  // ===== OPTIMISATION =====
  
  async optimizeProject(projectId, strategy, kerfWidth) {
    try {
      const response = await api.post(`/opti-coupe/optimization/${projectId}`, {
        strategy,
        kerfWidth
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      throw error;
    }
  }

  async getOptimizationResults(projectId) {
    try {
      const response = await api.get(`/opti-coupe/optimization/results/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      throw error;
    }
  }

  async getOptimizationResult(projectId, resultId) {
    try {
      const response = await api.get(`/opti-coupe/optimization/results/${projectId}/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error);
      throw error;
    }
  }

  async previewOptimization(projectId, strategy, kerfWidth) {
    try {
      const response = await api.post(`/opti-coupe/optimization/preview/${projectId}`, {
        strategy,
        kerfWidth
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      throw error;
    }
  }

  async getAvailableStrategies() {
    try {
      const response = await api.get('/opti-coupe/optimization/strategies');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stratégies:', error);
      // Retourner les stratégies par défaut en cas d'erreur
      return [
        {
          value: 'LENGTH_FIRST',
          label: 'Priorité Longueur',
          description: 'Optimise en donnant la priorité aux coupes en longueur',
          icon: '↔️',
        },
        {
          value: 'WIDTH_FIRST',
          label: 'Priorité Largeur', 
          description: 'Optimise en donnant la priorité aux coupes en largeur',
          icon: '↕️',
        },
        {
          value: 'GRAIN_RESPECT',
          label: 'Respect du Fil',
          description: 'Respecte absolument le sens du fil du bois',
          icon: '🪵',
        },
        {
          value: 'WASTE_MINIMIZE',
          label: 'Minimiser les Chutes',
          description: 'Minimise au maximum les pertes de matière',
          icon: '♻️',
        },
      ];
    }
  }

  // ===== UTILITAIRES =====

  formatDimensions(width, height, thickness) {
    return `${width} × ${height} × ${thickness} mm`;
  }

  formatArea(width, height) {
    const area = (width * height) / 1000000; // mm² → m²
    return `${area.toFixed(2)} m²`;
  }

  formatPrice(pricePerM2, width, height) {
    const area = (width * height) / 1000000;
    const totalPrice = area * pricePerM2;
    return `${totalPrice.toFixed(2)} €`;
  }

  getGrainDirectionLabel(direction) {
    switch (direction) {
      case 'HORIZONTAL': return 'Horizontal →';
      case 'VERTICAL': return 'Vertical ↑';
      case 'NONE': return 'Indifférent';
      default: return direction;
    }
  }

  getGrainDirectionIcon(direction) {
    switch (direction) {
      case 'HORIZONTAL': return '↔️';
      case 'VERTICAL': return '↕️';
      case 'NONE': return '🔄';
      default: return '❓';
    }
  }

  validatePiece(piece) {
    const errors = [];

    if (!piece.reference?.trim()) {
      errors.push('La référence est obligatoire');
    }

    if (!piece.name?.trim()) {
      errors.push('Le nom est obligatoire');
    }

    if (!piece.width || piece.width <= 0) {
      errors.push('La largeur doit être supérieure à 0');
    }

    if (!piece.height || piece.height <= 0) {
      errors.push('La hauteur doit être supérieure à 0');
    }

    if (!piece.thickness || piece.thickness <= 0) {
      errors.push('L\'épaisseur doit être supérieure à 0');
    }

    if (!piece.material?.trim()) {
      errors.push('Le matériau est obligatoire');
    }

    if (!piece.quantity || piece.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validatePanel(panel) {
    const errors = [];

    if (!panel.name?.trim()) {
      errors.push('Le nom est obligatoire');
    }

    if (!panel.width || panel.width <= 0) {
      errors.push('La largeur doit être supérieure à 0');
    }

    if (!panel.height || panel.height <= 0) {
      errors.push('La hauteur doit être supérieure à 0');
    }

    if (!panel.thickness || panel.thickness <= 0) {
      errors.push('L\'épaisseur doit être supérieure à 0');
    }

    if (!panel.material?.trim()) {
      errors.push('Le matériau est obligatoire');
    }

    if (panel.pricePerM2 === undefined || panel.pricePerM2 < 0) {
      errors.push('Le prix au m² doit être positif');
    }

    if (!panel.stock || panel.stock <= 0) {
      errors.push('Le stock doit être supérieur à 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new OptiCoupeService(); 