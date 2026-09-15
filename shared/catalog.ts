export const vehicleCatalog = {
  'Alfa Romeo': ['147','156','159','166','Giulietta','Giulia','Stelvio','Tonale'],
  Audi: ['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4','Q5','Q7','Q8','TT'],
  BMW: ['1 Series','2 Series','3 Series','4 Series','5 Series','6 Series','7 Series','8 Series','i3','i4','i5','i7','iX','iX1','iX3','X1','X2','X3','X4','X5','X6','X7','XM','Z4'],
  Chevrolet: ['Aveo','Cruze','Captiva','Orlando','Spark','Trax'],
  Chrysler: ['300C','Pacifica','Voyager'],
  Citroen: ['AMI','C1','C2','C3','C3 Aircross','C3 Picasso','C4','C4 Aircross','C4 Cactus','C4 Picasso','C5','C5 Aircross','C5 Tourer','C5 X','C6','C8','C-Crosser','C-Elysee','C-Zero','Berlingo','Jumpy','Jumper','Nemo','SpaceTourer','Xsara Picasso'],
  Cupra: ['Born','Formentor','Ateca','Leon'],
  Dacia: ['Dokker','Duster','Jogger','Lodgy','Logan','Sandero','Spring'],
  Dodge: ['Avenger','Caliber','Challenger','Charger','Durango','Journey','RAM'],
  Fiat: ['500','500X','500L','Bravo','Doblo','Ducato','Panda','Punto','Tipo'],
  Ford: ['B-Max','C-Max','EcoSport','Edge','Explorer','Fiesta','Focus','Galaxy','Kuga','Mondeo','Mustang','Puma','S-Max','Tourneo','Transit','Transit Connect'],
  Honda: ['Accord','Civic','CR-V','CR-Z','HR-V','Jazz','Pilot'],
  Hyundai: ['i10','i20','i30','Ioniq','Kona','Santa Fe','Staria','Tucson'],
  Jaguar: ['E-Pace','F-Pace','F-Type','XE','XF','XJ'],
  Jeep: ['Avenger','Cherokee','Compass','Gladiator','Grand Cherokee','Renegade','Wrangler'],
  Kia: ['Ceed','Carnival','EV6','Niro','Picanto','Rio','Sorento','Sportage','Stonic'],
  Lancia: ['Delta','Ypsilon'],
  'Land Rover': ['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport'],
  Lexus: ['CT','ES','GS','IS','LC','LS','NX','RX','UX'],
  Mazda: ['2','3','5','6','CX-3','CX-5','CX-30','CX-60','CX-80','MX-5'],
  Mercedes: ['A-Class','B-Class','C-Class','CLA','CLS','E-Class','G-Class','GLA','GLB','GLC','GLE','GLK','GLS','S-Class','V-Class','Citan','Sprinter','Vito'],
  Mini: ['Cooper','Clubman','Countryman','Paceman'],
  Mitsubishi: ['ASX','Colt','Eclipse Cross','L200','Outlander','Pajero'],
  Nissan: ['Juke','Leaf','Micra','Navara','Primastar','Qashqai','X-Trail'],
  Opel: ['Adam','Agila','Antara','Astra','Combo','Corsa','Crossland','Grandland','Insignia','Meriva','Mokka','Movano','Omega','Vivaro','Zafira'],
  Peugeot: ['108','208','2008','206','207','308','3008','307','407','508','5008','Partner','Expert','Boxer','Rifter'],
  Porsche: ['911','718','Cayenne','Macan','Panamera','Taycan'],
  Renault: ['Arkana','Austral','Captur','Clio','Espace','Kadjar','Kangoo','Koleos','Megane','Scenic','Talisman','Trafic','Master'],
  Saab: ['9-3','9-5'],
  Seat: ['Alhambra','Altea','Arona','Ateca','Ibiza','Leon','Tarraco','Toledo'],
  Skoda: ['Fabia','Kamiq','Karoq','Kodiaq','Octavia','Rapid','Scala','Superb','Yeti'],
  Smart: ['ForTwo','ForFour','#1','#3'],
  Subaru: ['BRZ','Forester','Impreza','Legacy','Outback','Solterra','XV'],
  Suzuki: ['Across','Baleno','Ignis','Jimny','S-Cross','Swift','Vitara'],
  Tesla: ['Model 3','Model S','Model X','Model Y'],
  Toyota: ['Auris','Aygo','Avensis','C-HR','Camry','Corolla','Highlander','Hilux','Land Cruiser','Prius','Proace','RAV4','Yaris'],
  Volkswagen: ['Amarok','Arteon','Beetle','Caddy','Crafter','Golf','ID.3','ID.4','ID.5','ID.7','Passat','Polo','Sharan','T-Cross','T-Roc','Tayron','Tiguan','Touareg','Touran','Transporter'],
  Volvo: ['C30','C40','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90'],
  GAZ: ['24','31','69','2705','3302','Gazelle'],
  Moskvich: ['2140','412','3','6'],
  VAZ: ['2101','2106','2107','2110','2114','Niva','Niva Travel'],
  'Citas markas': ['Cits modelis']
} as const

export type VehicleCategory = 'passenger' | 'crossover' | 'commercial'

const crossoverModels = new Set([
  'Stelvio','Tonale',
  'X1','X2','X3','X4','X5','X6','X7','XM','iX','iX1','iX3',
  'Q2','Q3','Q4','Q5','Q7','Q8','E-Pace','F-Pace','GLA','GLB','GLC','GLE','GLK','GLS',
  'G-Class','C-Crosser','C3 Aircross','C4 Aircross','C5 Aircross','C5 X','C4 Picasso','C3 Picasso','C8','Xsara Picasso',
  'Formentor','Ateca','Arkana','Austral','Captur','Kadjar','Koleos','Eclipse Cross','Outlander','Pajero',
  'Cherokee','Compass','Grand Cherokee','Renegade','Wrangler','Defender','Discovery','Discovery Sport',
  'Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','NX','RX','UX','CX-3','CX-5','CX-30','CX-60','CX-80',
  'Juke','Qashqai','X-Trail','Kona','Santa Fe','Tucson','Sportage','Sorento','Niro','Stonic','EV6','Pilot',
  '2008','3008','5008','Kuga','Puma','Edge','Explorer','RAV4','C-HR','Highlander','Land Cruiser',
  '500X','500L','B-Max','C-Max','Orlando','Pacifica','Voyager','5','Countryman','Paceman','Meriva','Altea',
  'T-Cross','T-Roc','Tayron','Tiguan','Touareg','Kamiq','Karoq','Kodiaq','Yeti','Arona','Tarraco',
  'Forester','Outback','Solterra','XV','Vitara','S-Cross','Jimny','Ignis','Across','Niva','Niva Travel',
  'Duster','Jogger','Durango','Journey','Model X','Model Y','Macan','Cayenne','C40','Smart #1','Smart #3'
])

const minivanModels = new Set([
  'Touran','Sharan','S-Max','Galaxy','Alhambra','Espace','Scenic','Carnival','SpaceTourer','Lodgy'
])

const commercialModels = new Set([
  'V-Class','Caddy','Crafter','Transporter','Amarok','Sprinter','Citan','Vito','Berlingo','Jumpy','Jumper','Nemo',
  'Combo','Movano','Vivaro','Partner','Expert','Boxer','Rifter','Dokker','Kangoo','Trafic','Master','Primastar','Proace',
  'Ducato','Doblo','Transit','Transit Connect','Tourneo','Staria','Hilux','Navara','L200','Gazelle','2705','3302','RAM','Gladiator'
])

export function categoryForVehicle(make: string, model: string): VehicleCategory {
  if (commercialModels.has(model)) return 'commercial'
  if (minivanModels.has(model) || crossoverModels.has(model)) return 'crossover'
  return 'passenger'
}

export function priceCentsForCategory(category: VehicleCategory) {
  if (category === 'passenger') return 2500
  if (category === 'crossover') return 3000
  return 3500
}
