// Static country -> city options for the profile page.
// In a real app this usually comes from the backend; here it's seed data so the
// country/city (cascading) dropdown works out of the box.
export const countries = [
  {
    code: "EG",
    name: "Egypt",
    dial: "20",
    cities: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Mansoura"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dial: "966",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dial: "971",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
  },
  {
    code: "QA",
    name: "Qatar",
    dial: "974",
    cities: ["Doha", "Al Rayyan", "Lusail", "Al Wakrah"],
  },
  {
    code: "KW",
    name: "Kuwait",
    dial: "965",
    cities: ["Kuwait City", "Hawalli", "Salmiya", "Farwaniya"],
  },
  {
    code: "JO",
    name: "Jordan",
    dial: "962",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba"],
  },
  {
    code: "US",
    name: "United States",
    dial: "1",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    dial: "44",
    cities: ["London", "Manchester", "Birmingham", "Glasgow"],
  },
  {
    code: "DE",
    name: "Germany",
    dial: "49",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  },
  {
    code: "TR",
    name: "Turkey",
    dial: "90",
    cities: ["Istanbul", "Ankara", "Izmir", "Antalya"],
  },
];

export function citiesFor(countryCode) {
  return countries.find((c) => c.code === countryCode)?.cities ?? [];
}