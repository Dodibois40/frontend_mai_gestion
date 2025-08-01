import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  IconTrash, 
  IconAlertTriangle, 
  IconLoader2 
} from '@tabler/icons-react';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../ui/dialog';
import planningEquipeService from '../../services/planningEquipeService';

const BoutonSuppressionAffectations = ({ onAffectationsDeleted }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleSupprimerToutesLesAffectations = async () => {
    if (confirmationText !== 'SUPPRIMER TOUT') {
      toast.error('Veuillez taper "SUPPRIMER TOUT" pour confirmer');
      return;
    }

    setIsLoading(true);
    try {
      const resultat = await planningEquipeService.supprimerToutesLesAffectations();
      
      toast.success(
        `✅ ${resultat.affectationsSupprimees} affectations supprimées avec succès`,
        {
          duration: 5000,
          description: 'Toutes les affectations du planning ont été supprimées'
        }
      );
      
      // Fermer le dialog
      setIsDialogOpen(false);
      setConfirmationText('');
      
      // Callback pour rafraîchir les données
      if (onAffectationsDeleted) {
        onAffectationsDeleted();
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <IconTrash className="w-4 h-4 mr-2" />
        Supprimer toutes les affectations
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <IconAlertTriangle className="w-5 h-5" />
              🚨 DANGER : Suppression totale
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              <div className="space-y-2">
                <p>
                  <strong>Cette action est irréversible !</strong>
                </p>
                <p>
                  Vous êtes sur le point de supprimer <strong>TOUTES</strong> les affectations 
                  du planning équipe et du planning affaire.
                </p>
                <p>
                  Pour confirmer, tapez <strong>"SUPPRIMER TOUT"</strong> dans le champ ci-dessous :
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Tapez: SUPPRIMER TOUT"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setConfirmationText('');
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSupprimerToutesLesAffectations}
              disabled={isLoading || confirmationText !== 'SUPPRIMER TOUT'}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BoutonSuppressionAffectations; 