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

const categoryOverrides: Record<string, VehicleCategory> = {
  'Alfa Romeo:Stelvio':'crossover','Alfa Romeo:Tonale':'crossover',
  'Audi:Q2':'crossover','Audi:Q3':'crossover','Audi:Q4':'crossover','Audi:Q5':'crossover','Audi:Q7':'crossover','Audi:Q8':'crossover',
  'BMW:X1':'crossover','BMW:X2':'crossover','BMW:X3':'crossover','BMW:X4':'crossover','BMW:X5':'crossover','BMW:X6':'crossover','BMW:X7':'crossover','BMW:XM':'crossover','BMW:iX':'crossover','BMW:iX1':'crossover','BMW:iX3':'crossover',
  'Chevrolet:Captiva':'crossover','Chevrolet:Orlando':'crossover','Chevrolet:Trax':'crossover',
  'Chrysler:Pacifica':'crossover','Chrysler:Voyager':'crossover',
  'Citroen:C3 Aircross':'crossover','Citroen:C3 Picasso':'crossover','Citroen:C4 Aircross':'crossover','Citroen:C4 Picasso':'crossover','Citroen:C5 Aircross':'crossover','Citroen:C5 X':'crossover','Citroen:C8':'crossover','Citroen:C-Crosser':'crossover','Citroen:SpaceTourer':'crossover','Citroen:Xsara Picasso':'crossover',
  'Citroen:Berlingo':'commercial','Citroen:Jumpy':'commercial','Citroen:Jumper':'commercial','Citroen:Nemo':'commercial',
  'Cupra:Formentor':'crossover','Cupra:Ateca':'crossover',
  'Dacia:Dokker':'commercial','Dacia:Duster':'crossover','Dacia:Jogger':'crossover','Dacia:Lodgy':'crossover',
  'Dodge:Avenger':'crossover','Dodge:Durango':'crossover','Dodge:Journey':'crossover','Dodge:RAM':'commercial',
  'Fiat:500X':'crossover','Fiat:500L':'crossover','Fiat:Doblo':'commercial','Fiat:Ducato':'commercial',
  'Ford:B-Max':'crossover','Ford:C-Max':'crossover','Ford:EcoSport':'crossover','Ford:Edge':'crossover','Ford:Explorer':'crossover','Ford:Galaxy':'crossover','Ford:Kuga':'crossover','Ford:Puma':'crossover','Ford:S-Max':'crossover','Ford:Tourneo':'commercial','Ford:Transit':'commercial','Ford:Transit Connect':'commercial',
  'Honda:CR-V':'crossover','Honda:HR-V':'crossover','Honda:Pilot':'crossover',
  'Hyundai:Kona':'crossover','Hyundai:Santa Fe':'crossover','Hyundai:Staria':'commercial','Hyundai:Tucson':'crossover',
  'Jaguar:E-Pace':'crossover','Jaguar:F-Pace':'crossover',
  'Jeep:Avenger':'crossover','Jeep:Cherokee':'crossover','Jeep:Compass':'crossover','Jeep:Gladiator':'commercial','Jeep:Grand Cherokee':'crossover','Jeep:Renegade':'crossover','Jeep:Wrangler':'crossover',
  'Kia:Carnival':'crossover','Kia:EV6':'crossover','Kia:Niro':'crossover','Kia:Sorento':'crossover','Kia:Sportage':'crossover','Kia:Stonic':'crossover',
  'Land Rover:Defender':'crossover','Land Rover:Discovery':'crossover','Land Rover:Discovery Sport':'crossover','Land Rover:Freelander':'crossover','Land Rover:Range Rover':'crossover','Land Rover:Range Rover Evoque':'crossover','Land Rover:Range Rover Sport':'crossover',
  'Lexus:NX':'crossover','Lexus:RX':'crossover','Lexus:UX':'crossover',
  'Mazda:5':'crossover','Mazda:CX-3':'crossover','Mazda:CX-5':'crossover','Mazda:CX-30':'crossover','Mazda:CX-60':'crossover','Mazda:CX-80':'crossover',
  'Mercedes:G-Class':'crossover','Mercedes:GLA':'crossover','Mercedes:GLB':'crossover','Mercedes:GLC':'crossover','Mercedes:GLE':'crossover','Mercedes:GLK':'crossover','Mercedes:GLS':'crossover','Mercedes:V-Class':'commercial','Mercedes:Citan':'commercial','Mercedes:Sprinter':'commercial','Mercedes:Vito':'commercial',
  'Mini:Countryman':'crossover','Mini:Paceman':'crossover',
  'Mitsubishi:Eclipse Cross':'crossover','Mitsubishi:L200':'commercial','Mitsubishi:Outlander':'crossover','Mitsubishi:Pajero':'crossover',
  'Nissan:Juke':'crossover','Nissan:Navara':'commercial','Nissan:Primastar':'commercial','Nissan:Qashqai':'crossover','Nissan:X-Trail':'crossover',
  'Opel:Antara':'crossover','Opel:Crossland':'crossover','Opel:Grandland':'crossover','Opel:Meriva':'crossover','Opel:Mokka':'crossover','Opel:Zafira':'crossover','Opel:Combo':'commercial','Opel:Movano':'commercial','Opel:Vivaro':'commercial',
  'Peugeot:2008':'crossover','Peugeot:3008':'crossover','Peugeot:5008':'crossover','Peugeot:Partner':'commercial','Peugeot:Expert':'commercial','Peugeot:Boxer':'commercial','Peugeot:Rifter':'commercial',
  'Porsche:Cayenne':'crossover','Porsche:Macan':'crossover',
  'Renault:Arkana':'crossover','Renault:Austral':'crossover','Renault:Captur':'crossover','Renault:Kadjar':'crossover','Renault:Koleos':'crossover','Renault:Espace':'crossover','Renault:Scenic':'crossover','Renault:Kangoo':'commercial','Renault:Trafic':'commercial','Renault:Master':'commercial',
  'Seat:Alhambra':'crossover','Seat:Altea':'crossover','Seat:Arona':'crossover','Seat:Ateca':'crossover','Seat:Tarraco':'crossover',
  'Skoda:Kamiq':'crossover','Skoda:Karoq':'crossover','Skoda:Kodiaq':'crossover','Skoda:Yeti':'crossover',
  'Smart:#1':'crossover','Smart:#3':'crossover',
  'Subaru:Forester':'crossover','Subaru:Outback':'crossover','Subaru:Solterra':'crossover','Subaru:XV':'crossover',
  'Suzuki:Across':'crossover','Suzuki:Ignis':'crossover','Suzuki:Jimny':'crossover','Suzuki:S-Cross':'crossover','Suzuki:Vitara':'crossover',
  'Tesla:Model 3':'passenger','Tesla:Model X':'crossover','Tesla:Model Y':'crossover',
  'Toyota:C-HR':'crossover','Toyota:Highlander':'crossover','Toyota:Hilux':'commercial','Toyota:Land Cruiser':'crossover','Toyota:Proace':'commercial','Toyota:RAV4':'crossover',
  'Volkswagen:Amarok':'commercial','Volkswagen:Caddy':'commercial','Volkswagen:Crafter':'commercial','Volkswagen:Sharan':'crossover','Volkswagen:T-Cross':'crossover','Volkswagen:T-Roc':'crossover','Volkswagen:Tayron':'crossover','Volkswagen:Tiguan':'crossover','Volkswagen:Touareg':'crossover','Volkswagen:Touran':'crossover','Volkswagen:Transporter':'commercial',
  'Volvo:C40':'crossover','Volvo:XC40':'crossover','Volvo:XC60':'crossover','Volvo:XC70':'crossover','Volvo:XC90':'crossover',
  'VAZ:Niva':'crossover','VAZ:Niva Travel':'crossover',
  'GAZ:2705':'commercial','GAZ:3302':'commercial','GAZ:Gazelle':'commercial'
}

export function categoryForVehicle(make: string, model: string): VehicleCategory {
  const override = categoryOverrides[`${make.trim()}:${model.trim()}`]
  return override ?? 'passenger'
}

export function priceCentsForCategory(category: VehicleCategory) {
  if (category === 'passenger') return 2500
  if (category === 'crossover') return 3000
  return 3500
}
