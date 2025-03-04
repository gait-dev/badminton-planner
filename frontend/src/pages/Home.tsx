import ContactForm from '../components/ContactForm'
import React from 'react';
import FacebookIcon from '../components/icons/FacebookIcon'
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const center = {
  lat: 43.87672596342212,
  lng: 5.402588467207867
};

export default function Home() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resources/Prise de licence 2025.zip';
    link.download = 'Prise de licence 2025.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-6 px-20 h-screen">
        <div className="grid grid-cols-2 grid-rows-3 gap-6 h-full">
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
                          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((jour) => (
                            <th key={jour} className="border-b-2 border-aptbc-green/20 pb-2 px-2 text-aptbc-black font-semibold">
                              {jour}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">19h-22h</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">19h-22h30</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">17h30-19h30</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">19h-22h</td>
                          <td className="pt-2 px-2 text-center text-aptbc-black/80">19h-21h</td>
                        </tr>
                        <tr>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-purple-500 rounded-sm text-xs font-semibold text-center">Lycée</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Jeunes</span>
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
                              <span className="w-24 px-4 py-1 text-white bg-purple-500 rounded-sm text-xs font-semibold text-center">Lycée</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Jeunes</span>
                            </div>
                          </td>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-purple-500 rounded-sm text-xs font-semibold text-center">Lycée</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                            </div>
                          </td>
                          <td className="pt-2 px-2">
                            <div className="flex flex-col gap-1 items-center h-[4.5rem]">
                              <span className="w-24 px-4 py-1 text-white bg-purple-500 rounded-sm text-xs font-semibold text-center">Lycée</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Adultes</span>
                              <span className="w-24 px-4 py-1 text-white bg-aptbc-green rounded-sm text-xs font-semibold text-center">Jeunes</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
              </div>

              {/* Section Google Maps */}
              <div className="flex flex-col">
                <LoadScript googleMapsApiKey="AIzaSyCdkft1mwtFH6_x7EGzwT-zHjVBden3yag">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={16}
                  />
                </LoadScript>
                <p className="mt-2 text-sm text-white">104 Place Charles de Gaulle, 84400 Apt</p>
              </div>
            </div>

            {/* Bouton téléchargement sur 2 colonnes */}
            <div className="mt-4">
              <button
                onClick={handleDownload}
                className="w-full bg-white text-aptbc-black px-4 py-3 rounded hover:bg-gray-100 transition-colors flex items-center justify-center space-x-4"
              >
                <img src="zip.png" alt="Dossier" className="w-12 h-12" />
                <div className="text-left">
                  <div className="text-aptbc-green font-bold">Dossier d'inscription</div>
                  <div className="text-gray-600">Saison 2024 - 2025</div>
                </div>
              </button>
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
