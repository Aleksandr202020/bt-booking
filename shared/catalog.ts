export const vehicleCatalog = {
  BMW: ['1 Series','2 Series','3 Series','4 Series','5 Series','6 Series','7 Series','X1','X2','X3','X4','X5','X6','X7'],
  Audi: ['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q5','Q7','Q8'],
  Mercedes: ['A-Class','B-Class','C-Class','E-Class','S-Class','GLA','GLB','GLC','GLE','GLS','V-Class','Sprinter','Citan','Vito'],
  Volkswagen: ['Polo','Golf','Passat','Tiguan','Touareg','Touran','Caddy','Transporter','Sharan'],
  Skoda: ['Fabia','Scala','Octavia','Superb','Kamiq','Karoq','Kodiaq'],
  Volvo: ['V40','V60','V70','V90','S60','S80','S90','XC40','XC60','XC90'],
  Opel: ['Corsa','Astra','Insignia','Mokka','Crossland','Grandland','Zafira','Vivaro'],
  Toyota: ['Yaris','Corolla','Camry','RAV4','C-HR','Highlander','Proace'],
  Ford: ['Fiesta','Focus','Mondeo','Kuga','S-Max','Galaxy','Transit','Tourneo'],
  Renault: ['Clio','Megane','Captur','Kadjar','Austral','Scenic','Espace','Kangoo','Trafic'],
  Peugeot: ['208','308','508','2008','3008','5008','Partner','Expert'],
  Citroen: ['C3','C4','C5','Berlingo','Jumpy','SpaceTourer'],
  Nissan: ['Micra','Juke','Qashqai','X-Trail','Primastar'],
  Honda: ['Jazz','Civic','Accord','HR-V','CR-V'],
  Mazda: ['2','3','6','CX-3','CX-5','CX-60'],
  Kia: ['Rio','Ceed','Sportage','Sorento','Niro','Carnival'],
  Hyundai: ['i20','i30','Tucson','Santa Fe','Kona','Staria'],
  Tesla: ['Model 3','Model S','Model X','Model Y'],
  Fiat: ['500','Panda','Tipo','Doblo','Ducato'],
  Seat: ['Ibiza','Leon','Ateca','Arona','Tarraco'],
  Lexus: ['CT','IS','ES','NX','RX','UX','LS'],
  Mitsubishi: ['ASX','Outlander','Eclipse Cross','L200'],
  Subaru: ['Impreza','Forester','Outback','XV'],
  Suzuki: ['Swift','Vitara','S-Cross','Jimny'],
  Dacia: ['Sandero','Duster','Jogger','Dokker'],
  Other: ['Other model']
} as const

export type VehicleCategory = 'passenger' | 'crossover' | 'minivan' | 'commercial'

const crossoverModels = new Set(['X1','X2','X3','X4','X5','X6','X7','Q2','Q3','Q5','Q7','Q8','GLA','GLB','GLC','GLE','GLS','Tiguan','Touareg','Kamiq','Karoq','Kodiaq','Zafira','RAV4','C-HR','Highlander','Kuga','Captur','Kadjar','Austral','2008','3008','5008','Juke','Qashqai','X-Trail','HR-V','CR-V','CX-3','CX-5','CX-60','Sportage','Sorento','Niro','Tucson','Santa Fe','Kona','Model X','Model Y','NX','RX','UX','ASX','Outlander','Eclipse Cross','Forester','Outback','XV','Vitara','S-Cross','Jimny','Duster','Jogger','Arona','Ateca','Tarraco'])
const commercialModels = new Set(['Caddy','Berlingo','Partner','Doblo','Ducato','Expert','Jumpy','Proace','Vivaro','Transit','Tourneo','Kangoo','Trafic','Primastar','Staria','Sprinter','Citan','Vito','Transporter'])
const minivanModels = new Set(['V-Class','Sharan','Touran','S-Max','Galaxy','Espace','Scenic','Carnival','SpaceTourer'])

export function categoryForVehicle(make: string, model: string): VehicleCategory {
  if (commercialModels.has(model)) return 'commercial'
  if (minivanModels.has(model)) return 'minivan'
  if (crossoverModels.has(model)) return 'crossover'
  return 'passenger'
}

export function priceCentsForCategory(category: VehicleCategory) {
  if (category === 'passenger') return 2500
  if (category === 'crossover' || category === 'minivan') return 3000
  return 3500
}
