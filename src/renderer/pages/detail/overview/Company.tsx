import React, { useState } from 'react';
import { Globe, Calendar, MapPin, Info, Building, ChevronDown, ChevronUp } from 'lucide-react';
import _ from 'lodash';

const SimpleAccordion = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-white font-medium">{title}</span>
        </div>
        {isOpen ? 
          <ChevronUp className="h-5 w-5 text-gray-400" /> : 
          <ChevronDown className="h-5 w-5 text-gray-400" />
        }
      </button>
      
      {isOpen && (
        <div className="px-5 py-4 bg-gray-750 text-gray-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const DeveloperShowcase = ({ developer }) => {
  // Format the date from timestamp to readable format
  const formatFoundedDate = (timestamp) => {
    if (!timestamp) return null;
    
    let dateNumber;
    if (typeof timestamp === 'bigint') {
      dateNumber = Number(timestamp.toString());
    } else if (typeof timestamp === 'string') {
      dateNumber = Number(timestamp);
    } else {
      dateNumber = timestamp;
    }
    
    const date = new Date(dateNumber);
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long'
    });
  };

  // Get country name from code
  const getCountryName = (countryCode) => {
    const countryMap = {
      156: "China",
      392: "Japan",
      840: "United States",
      // Add more as needed
    };
    
    if (countryCode === null || countryCode === undefined) return null;
    return countryMap[countryCode] || "International";
  };

  const foundedDate = formatFoundedDate(developer.startedAt);
  const country = getCountryName(developer.country);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        {/* Header with title */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Building className="h-6 w-6 mr-2 text-blue-300" />
            {developer.name}
          </h1>
        </div>
        
        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Description with custom accordion */}
          {developer.description && (
            <SimpleAccordion 
              title="About the Publisher" 
              icon={<Info className="h-5 w-5 text-blue-400" />}
            >
              <p>{developer.description}</p>
            </SimpleAccordion>
          )}
          
          {/* Details grid */}
          <div className="bg-gray-800 rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country */}
              {country && (
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Headquarters</p>
                    <p className="text-white font-medium">{country}</p>
                  </div>
                </div>
              )}
              
              {/* Founded Date */}
              {foundedDate && (
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-700 p-3 rounded-full">
                    <Calendar className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Founded</p>
                    <p className="text-white font-medium">{foundedDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Website button */}
          {developer.url && (
            <a 
              href={developer.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium rounded-lg py-3 px-4 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Visit Official Website</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


export default DeveloperShowcase;
