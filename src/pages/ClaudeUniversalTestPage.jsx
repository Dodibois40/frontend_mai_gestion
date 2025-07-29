import React from 'react';
import UniversalClaude from '@/components/UniversalClaude';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ClaudeUniversalTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Claude Sonnet 4 - Assistant Universel
          </h1>
          <p className="text-gray-600">
            Test du nouveau Claude universel avec support multi-modal et capacités étendues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌟 Mode Universel
                <Badge variant="secondary">Par défaut</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Questions générales et connaissances</li>
                <li>• Conversations libres</li>
                <li>• Conseils personnels</li>
                <li>• Explications et apprentissage</li>
                <li>• Culture, sciences, actualités</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💼 Mode CRM
                <Badge variant="outline">Business</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Analyse des données métier</li>
                <li>• Stratégies commerciales</li>
                <li>• Insights clients</li>
                <li>• Métriques et KPIs</li>
                <li>• Recommandations business</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Mode Créatif
                <Badge style={{ background: '#e056fd', color: 'white' }}>Créatif</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Écriture et rédaction</li>
                <li>• Brainstorming d'idées</li>
                <li>• Concepts artistiques</li>
                <li>• Storytelling</li>
                <li>• Inspiration créative</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 Mode Technique
                <Badge style={{ background: '#f093fb', color: 'white' }}>Tech</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Programmation et code</li>
                <li>• Debugging et optimisation</li>
                <li>• Architecture logicielle</li>
                <li>• Technologies et frameworks</li>
                <li>• Résolution de problèmes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 Actions Rapides Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span>🧠</span>
                <span className="text-sm">Expliquer des concepts</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span className="text-sm">Brainstormer des idées</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🐛</span>
                <span className="text-sm">Debugger du code</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🍳</span>
                <span className="text-sm">Proposer des recettes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌍</span>
                <span className="text-sm">Traduire des textes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📝</span>
                <span className="text-sm">Résumer du contenu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💬 Exemples de Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🌟 Questions Générales :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "Quel temps fait-il à Paris ?"</li>
                  <li>• "Raconte-moi une blague"</li>
                  <li>• "Explique-moi la physique quantique"</li>
                  <li>• "Conseille-moi un bon livre"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">💼 Questions Business :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "Analyse mes données de vente"</li>
                  <li>• "Stratégie pour ce client"</li>
                  <li>• "Optimise ma marge"</li>
                  <li>• "Rédige un email commercial"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🎨 Questions Créatives :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "Écris-moi un poème"</li>
                  <li>• "Idées pour mon blog"</li>
                  <li>• "Crée un slogan publicitaire"</li>
                  <li>• "Histoire courte originale"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🔧 Questions Techniques :</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• "Optimise ce code React"</li>
                  <li>• "Architecture microservices"</li>
                  <li>• "Résoudre cette erreur SQL"</li>
                  <li>• "Meilleure pratique API"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">ℹ️</span>
            <span className="font-semibold text-blue-800">Comment utiliser :</span>
          </div>
          <p className="text-blue-700 text-sm">
            Cliquez sur l'icône Claude en bas à droite pour ouvrir le chat. 
            Choisissez votre mode (Universel, CRM, Créatif, Technique) et posez n'importe quelle question !
            Claude détecte automatiquement le contexte et s'adapte à vos besoins.
          </p>
        </div>
      </div>

      {/* Composant Claude Universel */}
      <UniversalClaude />
    </div>
  );
};

export default ClaudeUniversalTestPage; 