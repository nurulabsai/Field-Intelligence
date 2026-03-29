export interface TanzaniaRegion {
  name: string;
  districts: string[];
}

export const TANZANIA_REGIONS: TanzaniaRegion[] = [
  { name: 'Arusha', districts: ['Arusha City', 'Arusha', 'Karatu', 'Longido', 'Meru', 'Monduli', 'Ngorongoro'] },
  { name: 'Dar es Salaam', districts: ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'] },
  { name: 'Dodoma', districts: ['Bahi', 'Chamwino', 'Chemba', 'Dodoma City', 'Kondoa', 'Kongwa', 'Mpwapwa'] },
  { name: 'Geita', districts: ['Bukombe', 'Chato', 'Geita', 'Mbogwe', "Nyang'hwale"] },
  { name: 'Iringa', districts: ['Iringa Urban', 'Iringa Rural', 'Kilolo', 'Mafinga', 'Mufindi'] },
  { name: 'Kagera', districts: ['Biharamulo', 'Bukoba Urban', 'Bukoba Rural', 'Karagwe', 'Kyerwa', 'Missenyi', 'Muleba', 'Ngara'] },
  { name: 'Katavi', districts: ['Mlele', 'Mpanda Urban', 'Mpanda Rural', 'Nsimbo'] },
  { name: 'Kigoma', districts: ['Buhigwe', 'Kakonko', 'Kasulu Urban', 'Kasulu Rural', 'Kibondo', 'Kigoma Urban', 'Kigoma Rural', 'Uvinza'] },
  { name: 'Kilimanjaro', districts: ['Hai', 'Moshi Urban', 'Moshi Rural', 'Mwanga', 'Rombo', 'Same', 'Siha'] },
  { name: 'Lindi', districts: ['Kilwa', 'Lindi Urban', 'Lindi Rural', 'Liwale', 'Nachingwea', 'Ruangwa'] },
  { name: 'Manyara', districts: ['Babati Urban', 'Babati Rural', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro'] },
  { name: 'Mara', districts: ['Bunda', 'Butiama', 'Musoma Urban', 'Musoma Rural', 'Rorya', 'Serengeti', 'Tarime'] },
  { name: 'Mbeya', districts: ['Busokelo', 'Chunya', 'Kyela', 'Mbarali', 'Mbeya City', 'Mbeya Rural', 'Rungwe'] },
  { name: 'Mjini Magharibi', districts: ['Mjini', 'Magharibi A', 'Magharibi B'] },
  { name: 'Morogoro', districts: ['Gairo', 'Kilombero', 'Kilosa', 'Malinyi', 'Morogoro Urban', 'Morogoro Rural', 'Mvomero', 'Rufiji', 'Ulanga'] },
  { name: 'Mtwara', districts: ['Masasi', 'Masasi Town', 'Mtwara Urban', 'Mtwara Rural', 'Nanyumbu', 'Newala', 'Tandahimba'] },
  { name: 'Mwanza', districts: ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Nyamagana', 'Sengerema', 'Ukerewe'] },
  { name: 'Njombe', districts: ['Ludewa', 'Makete', 'Njombe Urban', 'Njombe Rural', "Wanging'ombe"] },
  { name: 'Pwani', districts: ['Bagamoyo', 'Kibaha Urban', 'Kibaha Rural', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji'] },
  { name: 'Rukwa', districts: ['Kalambo', 'Nkasi', 'Sumbawanga Urban', 'Sumbawanga Rural'] },
  { name: 'Ruvuma', districts: ['Madaba', 'Mbinga', 'Namtumbo', 'Nyasa', 'Songea Urban', 'Songea Rural', 'Tunduru'] },
  { name: 'Shinyanga', districts: ['Kahama', 'Kahama Town', 'Kishapu', 'Shinyanga Urban', 'Shinyanga Rural'] },
  { name: 'Simiyu', districts: ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu'] },
  { name: 'Singida', districts: ['Ikungi', 'Iramba', 'Manyoni', 'Mkalama', 'Singida Urban', 'Singida Rural'] },
  { name: 'Songwe', districts: ['Ileje', 'Mbozi', 'Momba', 'Songwe'] },
  { name: 'Tabora', districts: ['Igunga', 'Kaliua', 'Nzega', 'Nzega Town', 'Sikonge', 'Tabora Urban', 'Urambo', 'Uyui'] },
  { name: 'Tanga', districts: ['Handeni', 'Handeni Town', 'Kilindi', 'Korogwe', 'Korogwe Town', 'Lushoto', 'Mkinga', 'Muheza', 'Pangani', 'Tanga City'] },
  { name: 'Unguja Kaskazini', districts: ['Kaskazini A', 'Kaskazini B'] },
  { name: 'Unguja Kusini', districts: ['Kati', 'Kusini'] },
];

export function getDistricts(regionName: string): string[] {
  return TANZANIA_REGIONS.find(r => r.name === regionName)?.districts ?? [];
}
