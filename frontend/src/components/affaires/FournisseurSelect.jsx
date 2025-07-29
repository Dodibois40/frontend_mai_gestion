import React, { useState, useEffect } from 'react';
import { Combobox, Group, Text, Badge, Loader, useCombobox, InputBase } from '@mantine/core';
import { IconBuilding, IconCheck, IconX, IconChevronDown } from '@tabler/icons-react';
import { getFournisseursActifs } from '@/services/fournisseurService';

const FournisseurSelect = ({ value, onChange, error, placeholder = "Sélectionner un fournisseur", ...props }) => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      // Garder la valeur sélectionnée si elle existe
      if (value) {
        setSearch('');
      }
    },
  });

  useEffect(() => {
    loadFournisseurs();
  }, []);

  // Reset search when value changes from parent
  useEffect(() => {
    if (value) {
      setSearch('');
    }
  }, [value]);

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      const data = await getFournisseursActifs();
      // Validation robuste des données
      const validFournisseurs = Array.isArray(data) ? data.filter(f => 
        f && 
        typeof f === 'object' && 
        typeof f.nom === 'string' && 
        f.nom.trim().length > 0
      ) : [];
      setFournisseurs(validFournisseurs);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      setFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les fournisseurs selon la recherche avec validation stricte
  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    // Vérification robuste de l'objet fournisseur
    if (!fournisseur || typeof fournisseur !== 'object') return false;
    
    const searchLower = (search || '').toLowerCase().trim();
    if (!searchLower) return true;

    // Vérification et nettoyage des chaînes
    const nom = String(fournisseur.nom || '').toLowerCase();
    const codeClient = String(fournisseur.codeClient || '').toLowerCase();
    const contact = String(fournisseur.contact || '').toLowerCase();

    return nom.includes(searchLower) ||
           codeClient.includes(searchLower) ||
           contact.includes(searchLower);
  });

  // Composant d'option personnalisé avec validation
  const FournisseurOption = ({ fournisseur }) => {
    // Validation de l'objet fournisseur
    if (!fournisseur || typeof fournisseur !== 'object') {
      return <Text size="sm" c="red">Données invalides</Text>;
    }

    return (
      <Group>
        <IconBuilding size={16} />
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{String(fournisseur.nom || 'Non défini')}</Text>
          <Group gap={8}>
            {fournisseur.codeClient && (
              <Text size="xs" c="dimmed">Code: {String(fournisseur.codeClient)}</Text>
            )}
            {fournisseur.contact && (
              <Text size="xs" c="dimmed">Contact: {String(fournisseur.contact)}</Text>
            )}
            {fournisseur.enCompte ? (
              <Badge size="xs" color="blue" variant="light">
                <IconCheck size={8} style={{ marginRight: 2 }} />
                En compte
              </Badge>
            ) : (
              <Badge size="xs" color="gray" variant="light">
                <IconX size={8} style={{ marginRight: 2 }} />
                Non
              </Badge>
            )}
          </Group>
        </div>
      </Group>
    );
  };

  // Génération des options avec validation
  const options = filteredFournisseurs.map((fournisseur) => {
    const key = fournisseur.id || fournisseur.nom || Math.random().toString();
    const optionValue = String(fournisseur.nom || '');
    
    return (
      <Combobox.Option value={optionValue} key={key}>
        <FournisseurOption fournisseur={fournisseur} />
      </Combobox.Option>
    );
  });

  // Affichage de la valeur sélectionnée
  const displayValue = value || search || '';

  if (loading) {
    return (
      <InputBase
        {...props}
        disabled
        rightSection={<Loader size={16} />}
        placeholder="Chargement des fournisseurs..."
        error={error}
        value=""
        readOnly
      />
    );
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        if (onChange && typeof onChange === 'function') {
          onChange(val);
        }
        combobox.closeDropdown();
        setSearch('');
      }}
      position="bottom-start"
      withinPortal={false}
    >
      <Combobox.Target>
        <InputBase
          {...props}
          value={displayValue}
          onChange={(event) => {
            const newValue = event?.currentTarget?.value || '';
            setSearch(newValue);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.toggleDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            if (!value) {
              setSearch('');
            }
          }}
          placeholder={placeholder}
          rightSection={<IconChevronDown size={16} />}
          error={error}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>
              {fournisseurs.length === 0 ? 'Aucun fournisseur disponible' : 'Aucun fournisseur trouvé'}
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default FournisseurSelect; 