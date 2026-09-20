// Static country -> city options for the profile page.
// In a real app this usually comes from the backend; here it's seed data so the
// country/city (cascading) dropdown works out of the box.
export const countries = [
  {
    code: "EG",
    name: "Egypt",
    cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Mansoura"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
  },
  {
    code: "QA",
    name: "Qatar",
    cities: ["Doha", "Al Rayyan", "Lusail", "Al Wakrah"],
  },
  {
    code: "KW",
    name: "Kuwait",
    cities: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya"],
  },
  {
    code: "JO",
    name: "Jordan",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba"],
  },
  {
    code: "US",
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Glasgow"],
  },
  {
    code: "DE",
    name: "Germany",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  },
  {
    code: "TR",
    name: "Turkey",
    cities: ["Istanbul", "Ankara", "Izmir", "Antalya"],
  },
];

export function citiesFor(countryCode) {
  return countries.find((c) => c.code === countryCode)?.cities ?? [];
}