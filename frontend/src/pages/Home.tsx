import ContactForm from '../components/ContactForm'
import React from 'react';
import FacebookIcon from '../components/icons/FacebookIcon'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const center = {
  lat: 43.87241873752749,
  lng: 5.399661546755915
};

export default function Home() {
  const { user } = useAuth();
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resources/Prise de licence 2026.zip';
    link.download = 'Prise de licence 2026.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="container mx-auto py-6 px-20 h-screen">
        <div className="grid grid-cols-2 grid-rows-[auto_1fr_1fr] gap-6 h-full">
          {/* Card Authentification */}
          {/*<div className="col-span-2 bg-gray-50/50 border border-gray-100 rounded-md p-3 flex items-center justify-end text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              {user ? (
                <span>Bienvenue, {user.first_name}</span>
              ) : (
                <Link
                  to="/login"
                  className="text-aptbc-green hover:text-aptbc-green/90 transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>*/}
          <div></div>
          {/* Card Logo et Horaires - Prend 2 colonnes, 1 ligne */}
          <div className="col-span-2 row-span-1 bg-gray-50 border border-gray-200 rounded-lg rounded-l-none shadow-lg flex overflow-hidden">
            <img src="/logo_aptbc.jpg" alt="Logo du club" className="h-full object-cover border-r border-gray-200" />
            <div className="flex-1 p-6">
              <div className="space-y-4 mt-5">
                <div className="flex gap-4">
                  <h2 className="text-2xl font-bold text-aptbc-black whitespace-nowrap me-5">Horaires</h2>
                  <div className="flex-1">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {[ 'Mardi', 'Samedi', 'Samedi', 'Dimanche'].map((jour) => (
                            <th key={jour} className="border-b-2 border-aptbc-green/20 pb-2 px-2 text-aptbc-black font-semibold">
                              {jour}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">19h-23h</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">8h30-11h</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">11h-12h30</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">9h-12h</td>
                        </tr>
                        <tr>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-violet-500 rounded-sm text-xs font-semibold text-center">Guigou</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                            </div>
                          </td>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-violet-500 rounded-sm text-xs font-semibold text-center">Guigou</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                            </div>
                          </td>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-violet-500 rounded-sm text-xs font-semibold text-center">Guigou</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Jeunes</span>
                            </div>
                          </td>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-violet-500 rounded-sm text-xs font-semibold text-center">Guigou</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-700 font-medium text-center">
                        ⚠️ Horaires temporaires pendant les travaux du lycée
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Prix Licences - 1 colonne, 2 lignes */}
          <div className="row-span-2 bg-aptbc-black rounded-lg shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-white">Licence</h2>
            <div className="grid grid-cols-2 gap-4 flex-grow">
              {/* Section texte licences */}
              <div className="space-y-3 text-white">
                <div>
                  Vous avez envie de vous inscrire?
                  Venez d'abord essayer, pendant deux séances, pour vous faire une idée au gymnase du Lycée.
                </div>
                <div>
                  Licence Adulte:<span className="text-aptbc-green font-bold"> 140 euros</span> 
                </div>
                <div>
                  Licence Jeune:<span className="text-aptbc-green font-bold"> 120 euros</span> 
                </div>
                <div>Des réductions sont disponibles pour les familles.</div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-white text-aptbc-black px-4 py-3 rounded hover:bg-gray-100 transition-colors flex items-center justify-center space-x-4 mt-6"
                >
                  <img src="/zip.png" alt="Dossier" className="w-10 h-10" />
                  <div className="text-left">
                    <div className="text-aptbc-green font-bold">Dossier d'inscription</div>
                    <div className="text-gray-600">Saison 2025 - 2026</div>
                  </div>
                </button>
              </div>

              {/* Section Google Maps */}
              <div className="flex flex-col">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={16}
                  >
                    <Marker position={center} />
                  </GoogleMap>
                </LoadScript>
                <p className="mt-2 text-sm text-white">130 Bd Maréchal Joffre, 84400 Apt</p>
              </div>
            </div>

          </div>

          {/* Card Formulaire de Contact - 1 colonne, 2 lignes */}
          <div className="col-span-1 row-span-2 bg-gray-50 border border-gray-200 rounded-lg shadow-lg p-6 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-aptbc-black whitespace-nowrap">Nous contacter</h2>
              <a 
                href="https://www.facebook.com/groups/APTBADMINTONCLUB/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FacebookIcon className="w-8 h-8" />
              </a>
            </div>
            <div className="flex-grow">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
