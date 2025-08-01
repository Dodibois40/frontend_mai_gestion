import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Camera, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    dateNaissance: '',
    poste: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.profile?.adresse || '',
        ville: user.profile?.ville || '',
        codePostal: user.profile?.codePostal || '',
        dateNaissance: user.profile?.dateNaissance ? user.profile.dateNaissance.split('T')[0] : '',
        poste: user.profile?.poste || '',
        bio: user.profile?.bio || ''
      });
      setImagePreview(user.avatar || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const updateData = {
        ...profileData
      };

      // Si une nouvelle image a été sélectionnée
      if (profileImage) {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          formData.append(key, updateData[key]);
        });
        formData.append('avatar', profileImage);
        
        // TODO: Implémenter l'upload d'image plus tard
        // Pour l'instant, on envoie juste les données texte
        await updateProfile(updateData);
      } else {
        // Mise à jour sans image
        await updateProfile(updateData);
      }
      
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Informations du profil</h2>
        <p className="text-stone-600">Gérez vos informations personnelles et votre photo de profil.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Photo de profil
          </h3>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Aperçu du profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-stone-400" />
                )}
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
                Choisir une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-stone-500">JPG, PNG ou GIF. Maximum 5MB.</p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={profileData.prenom}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={profileData.nom}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={profileData.telephone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date de naissance
              </label>
              <input
                type="date"
                name="dateNaissance"
                value={profileData.dateNaissance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                Poste
              </label>
              <input
                type="text"
                name="poste"
                value={profileData.poste}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Adresse
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={profileData.adresse}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                style={{backgroundColor: '#fefefe'}}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={profileData.ville}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  style={{backgroundColor: '#fefefe'}}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={profileData.codePostal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  style={{backgroundColor: '#fefefe'}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            À propos
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Biographie
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
              style={{backgroundColor: '#fefefe'}}
              placeholder="Parlez-nous un peu de vous..."
            />
            <p className="text-sm text-stone-500 mt-1">
              Maximum 500 caractères
            </p>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? '#6b7c3d' : '#6b7c3d',
              border: 'none'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#556533')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6b7c3d')}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings; 