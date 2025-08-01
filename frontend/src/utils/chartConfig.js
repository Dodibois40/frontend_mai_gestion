import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Plugin pour les zones remplies
  BarElement,
  ArcElement,
} from 'chart.js';

// Enregistrer tous les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Important: enregistrer le plugin Filler
);

export default ChartJS; 