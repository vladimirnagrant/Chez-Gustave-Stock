import React, { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Clock,
  Package,
  User,
  ClipboardList,
  Trash2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Settings,
  ArrowLeft,
} from "lucide-react";

const EMPLOYEES_KEY = "stock:employees";
const CATALOGUE_KEY = "stock:catalogue:v2";
const REQUESTS_KEY = "stock:demandes";
const HISTORY_KEY = "stock:historique";
const CASH_KEY = "stock:monnaie";
const PINS_KEY = "stock:pins";

const DENOMINATIONS = [
  { id: "r005", type: "rouleau", value: 2.50, label: "Rouleau 5 cts (2.50)" },
  { id: "r010", type: "rouleau", value: 5, label: "Rouleau 10 cts (5.-)" },
  { id: "r020", type: "rouleau", value: 10, label: "Rouleau 20 cts (10.-)" },
  { id: "r050", type: "rouleau", value: 25, label: "Rouleau 50 cts (25.-)" },
  { id: "r1", type: "rouleau", value: 50, label: "Rouleau 1.- (50.-)" },
  { id: "r2", type: "rouleau", value: 100, label: "Rouleau 2.- (100.-)" },
  { id: "r5", type: "rouleau", value: 125, label: "Rouleau 5.- (125.-)" },
  { id: "b10", type: "billet", value: 10, label: "Billet 10.-" },
  { id: "b20", type: "billet", value: 20, label: "Billet 20.-" },
  { id: "b50", type: "billet", value: 50, label: "Billet 50.-" },
  { id: "b100", type: "billet", value: 100, label: "Billet 100.-" },
];

// Users: { id, name, role }  role: "employe" | "chef" | "manager"
const DEFAULT_USERS = [
  { id: "u1", name: "Vladimir",        role: "manager" },
  { id: "u2", name: "Antonio",         role: "employe" },
  { id: "u3", name: "Patricia",        role: "employe" },
  { id: "u4", name: "Lara",            role: "employe" },
  { id: "u5", name: "Silvestro",       role: "employe" },
  { id: "u6", name: "Ilaria",          role: "employe" },
  { id: "u7", name: "Tristan",         role: "employe" },
  { id: "u8", name: "Ahmed",           role: "employe" },
  { id: "u9", name: "Chef d'équipe",   role: "chef" },
  { id: "u10", name: "Manager",        role: "manager" },
];
const DEFAULT_PINS = Object.fromEntries(DEFAULT_USERS.map((u) => [u.id, "1234"]));
// Legacy: keep a flat name list for backward-compat where employees[] is still used
const DEFAULT_EMPLOYEES = DEFAULT_USERS.filter((u) => u.role === "employe").map((u) => u.name);

// Article: { id, code, name, category, subcategory, minStock }
const DEFAULT_CATALOGUE = [
  { id: "a1", code: "516897", name: "Coca-Cola Pet (50cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a2", code: "516894", name: "Coca-Cola Zéro Pet (50cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a3", code: "439885", name: "Coca-Cola Alu (33cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "ct" },
  { id: "a4", code: "409166", name: "Coca-Cola Zéro Alu (33cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "ct" },
  { id: "a5", code: "142857", name: "Eau Minérale Henniez Bleue Pet (50cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a6", code: "105829", name: "Eau Minérale Henniez Verte Pet (50cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a7", code: "490892", name: "Jus d'abricot (33cl)", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a8", code: "490890", name: "Jus de pomme (33cl)", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a9", code: "490894", name: "Jus de poire (33cl)", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a10", code: "409155", name: "Sinalco Pet (50cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a11", code: "477881", name: "Schweppes Pet (50cl)", category: "Boissons", subcategory: "Sodas", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a12", code: "511255", name: "Thé bio pêche Pet (50cl)", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a13", code: "472235", name: "Thé bio citron Pet (50cl)", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a14", code: "489922", name: "Thé bio vert Pet (50cl)", category: "Boissons", subcategory: "Thé froid", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a15", code: "499407", name: "Citronnade aux 2 Citrons M&A (33cl)", category: "Boissons", subcategory: "Jus", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a16", code: "490325", name: "Bière Panaché S/Alcool Canette Bilz (33cl)", category: "Boissons", subcategory: "Bières", groupe: "Alimentaire", minStock: 24, minUnit: "ct" },
  { id: "a17", code: "493166", name: "Eau Minérale Henniez Bleue Verre (50cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a18", code: "493153", name: "Eau Minérale Henniez Bleue Verre (75cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a19", code: "459784", name: "Eau Minérale Henniez Verte Verre (50cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a20", code: "459752", name: "Eau Minérale Henniez Verte Verre (75cl)", category: "Boissons", subcategory: "Eau", groupe: "Alimentaire", minStock: 12, minUnit: "btl" },
  { id: "a21", code: "482082", name: "Assem. Riesling/Sylvaner/Pinot Cuvée Gustave (75cl)", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a22", code: "482081", name: "Assem. Gamaret/Garanoir Cuvée Gustave (75cl)", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a23", code: "VIN-BLANC", name: "Vin du mois au choix blanc", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a24", code: "VIN-ROUGE", name: "Vin du mois au choix rouge", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a25", code: "492952", name: "Proseco", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a26", code: "492400", name: "Rosé l'instant cave de Genève", category: "Vins / Alcool Brasserie", subcategory: "Vins", groupe: "Alimentaire", minStock: 6, minUnit: "btl" },
  { id: "a27", code: "460745", name: "Apérol", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a28", code: "46054", name: "Crème de cassis", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a29", code: "471282", name: "Limonello Original Denis (1x70cl)", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a30", code: "491062", name: "Picon Bière 18° (100cl)", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a31", code: "460803", name: "Rhum", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a32", code: "468243", name: "Sirop de sureau", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a33", code: "460800", name: "Cognac", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a34", code: "487268", name: "Whisky", category: "Vins / Alcool Brasserie", subcategory: "Spiritueux", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a35", code: "474249", name: "Sirop Fraise (100cl)", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a36", code: "103286", name: "Sirop Framboise Pet Quality (100cl)", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a37", code: "92974", name: "Sirop de menthe (1lt)", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a38", code: "460545", name: "Sirop de Grenadine Monin (70cl) Brasserie", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a39", code: "460271", name: "Sirop de sucre de canne (1lt)", category: "Vins / Alcool Brasserie", subcategory: "Sirops", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a40", code: "130610", name: "Lait délactosé", category: "Produits laitiers", subcategory: "Lait", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a41", code: "494220", name: "Lait d'avoine", category: "Produits laitiers", subcategory: "Lait", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a42", code: "115779", name: "Lait entier 3.5", category: "Produits laitiers", subcategory: "Lait", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a43", code: "462165", name: "Ovomaltine Drink (33cl)", category: "Produits laitiers", subcategory: "Lait", groupe: "Alimentaire", minStock: 24, minUnit: "btl" },
  { id: "a44", code: "481323", name: "Yaourt vanille", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a45", code: "481322", name: "Yaourt nature", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a46", code: "481320", name: "Yaourt café", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a47", code: "481318", name: "Yaourt fraise", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a48", code: "481319", name: "Yaourt framboise", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a49", code: "481321", name: "Yaourt myrtilles", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a50", code: "481317", name: "Yaourt abricots", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a51", code: "481324", name: "Yaourt ananas", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 15, minUnit: "ct" },
  { id: "a52", code: "453169", name: "Yaourt délactosés vanille", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a53", code: "453166", name: "Yaourt délactosés framboise", category: "Produits laitiers", subcategory: "Yaourts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a54", code: "453939", name: "Riz au lait bonne maman", category: "Desserts", subcategory: "Desserts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a55", code: "461595", name: "Mousse au chocolat bonne maman", category: "Desserts", subcategory: "Desserts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a56", code: "102620", name: "Tiramisu", category: "Desserts", subcategory: "Desserts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a57", code: "409471", name: "Dessert bi couche myrtille", category: "Desserts", subcategory: "Desserts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a58", code: "463450", name: "Panna cotta", category: "Desserts", subcategory: "Desserts", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a59", code: "466831", name: "Glace pot artisan glacier vanille", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a60", code: "466832", name: "Glace pot artisan glacier abricot", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a61", code: "466833", name: "Glace pot artisan glacier citron", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a62", code: "466826", name: "Glace pot artisan glacier caramel", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a63", code: "466827", name: "Glace pot artisan glacier chocolat", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a64", code: "502843", name: "Glace pot artisan glacier exotique", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a65", code: "466834", name: "Glace pot artisan glacier fraise", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a66", code: "466835", name: "Glace pot artisan glacier framboise", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a67", code: "466825", name: "Glace pot artisan glacier café", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a68", code: "487902", name: "Glace pot artisan glacier straciatella", category: "Glace", subcategory: "Pots artisan", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a69", code: "14495", name: "Cornetto vanille", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a70", code: "14496", name: "Cornetto fraise", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a71", code: "14498", name: "Cornetto chocolat", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a72", code: "125770", name: "Glace magnum vanille amandes", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a73", code: "409383", name: "Glace magnum classique", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a74", code: "89004", name: "Glace magnum chocolat blanc", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a75", code: "409369", name: "Glace solero", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a76", code: "409371", name: "Glace à l'eau lippo", category: "Glace", subcategory: "Individuel", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a77", code: "459700", name: "Confiture orange", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a78", code: "459697", name: "Confiture figue", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a79", code: "448626", name: "Confiture fraise", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a80", code: "459699", name: "Confiture myrtille", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a81", code: "459695", name: "Confiture fruits rouges", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a82", code: "453051", name: "Miel", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a83", code: "448623", name: "Confiture abricot", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a84", code: "448625", name: "Confiture cerise", category: "Kiosque", subcategory: "Confitures & Miel", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a85", code: "487904", name: "Chocolat Tablette Suisse Extra Noir (36x40g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a86", code: "487905", name: "Chocolat Tablette Suisse Lait/Noisettes (36x40g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a87", code: "410048", name: "Chocolats Branches Cailler Lait (44x46g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a88", code: "483003", name: "Chocolats Branches Cailler Noir (44x46g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a89", code: "470318", name: "Chocolat Vermicelles Au Lait Natura Bio (600)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a90", code: "410047", name: "Chocolats Ragusa (32x50g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a91", code: "418522", name: "Chocolats Toblerone Lait (20x100g)", category: "Kiosque", subcategory: "Chocolats", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a92", code: "465601", name: "Cookies sans gluten bio vegan framboise", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a93", code: "465599", name: "Cookies sans gluten bio vegan chocolat", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a94", code: "465600", name: "Cookies sans gluten bio vegan noix au lait", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a95", code: "479121", name: "Cookies sans gluten bio vegan caramel", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a96", code: "507264", name: "Barre Céréales Cranberries Framboise Vegan (20x45gr)", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 20, minUnit: "btl" },
  { id: "a97", code: "507266", name: "Barre Céréales Chocolat (20x45gr)", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 20, minUnit: "btl" },
  { id: "a98", code: "BAR-NOIS", name: "Barre Céréales noisette (20x45gr)", category: "Kiosque", subcategory: "Cookies & Barres", groupe: "Alimentaire", minStock: 20, minUnit: "btl" },
  { id: "a99", code: "410062", name: "Chewing-Gum Stimorol Spearmint (50x14g)", category: "Kiosque", subcategory: "Chewing-Gum & Snacks", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a100", code: "465507", name: "Chewing-Gum Stimorol Strawberry (50x14g)", category: "Kiosque", subcategory: "Chewing-Gum & Snacks", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a101", code: "470128", name: "Chips", category: "Kiosque", subcategory: "Chewing-Gum & Snacks", groupe: "Alimentaire", minStock: 12, minUnit: "ct" },
  { id: "a102", code: "58679", name: "Crème à café", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a103", code: "123411", name: "Sucre en stick brasserie", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a104", code: "12224", name: "Assugrine", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a105", code: "468056", name: "Sucre de canne en sachet brasserie", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a106", code: "92995", name: "Sucre 5 gr sachet", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a107", code: "409026", name: "Panettone", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 5, minUnit: "btl" },
  { id: "a108", code: "462305", name: "Chocolat 58% (5kg)", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 2, minUnit: "btl" },
  { id: "a109", code: "491866", name: "Biscuit café brasserie", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a110", code: "132069", name: "Café", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 5, minUnit: "kg" },
  { id: "a111", code: "476995", name: "Sauce blanche salade", category: "Economat", subcategory: "Sauces", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a112", code: "424580", name: "Sauce italienne salade", category: "Economat", subcategory: "Sauces", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a113", code: "442530", name: "Sauce balsamic salade", category: "Economat", subcategory: "Sauces", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a114", code: "462269", name: "Café moulu déca", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 5, minUnit: "ct" },
  { id: "a115", code: "453061", name: "Assortiment de tisanes et thé", category: "Economat", subcategory: "Economat", groupe: "Alimentaire", minStock: 6, minUnit: "ct" },
  { id: "a116", code: "MAT-001", name: "Gants jetables", category: "Matériel", subcategory: "Hygiène", groupe: "Non Alimentaire", minStock: 10, minUnit: "ct" },
  { id: "a117", code: "MAT-002", name: "Sacs poubelle", category: "Matériel", subcategory: "Nettoyage", groupe: "Non Alimentaire", minStock: 5, minUnit: "ct" },
  { id: "a118", code: "MAT-003", name: "Gobelet Renversé - Thé", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a119", code: "MAT-004", name: "Gobelet Café", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a120", code: "MAT-005", name: "Gobelet Espresso", category: "Matériel", subcategory: "Gobelets", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a121", code: "MAT-006", name: "Boîte à pâtes", category: "Matériel", subcategory: "Boîte à pâtes", groupe: "Non Alimentaire", minStock: 20, minUnit: "ct" },
  { id: "a122", code: "MAT-007", name: "Couverts BIO", category: "Matériel", subcategory: "Couverts BIO", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a123", code: "MAT-008", name: "Serviettes Gustave", category: "Matériel", subcategory: "Serviettes Gustave", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a124", code: "MAT-009", name: "Pailles", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a125", code: "MAT-010", name: "Sous-verres", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
  { id: "a126", code: "MAT-011", name: "Serviette Brasserie", category: "Matériel", subcategory: "Brasserie", groupe: "Non Alimentaire", minStock: 50, minUnit: "ct" },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const SUPABASE_URL = "https://rmfraspxdwmgqkxbmobg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZnJhc3B4ZHdtZ3FreGJtb2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDM2NjYsImV4cCI6MjA5ODQ3OTY2Nn0.HZAp3ki90kkyEp5zmHE0vd7p3kHN5N59gqZ-jUWMpEY";
const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function loadList(key, fallback) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: SB_HEADERS }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0].value;
    return fallback;
  } catch {
    return undefined;
  }
}

async function saveList(key, value) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: "POST",
      headers: { ...SB_HEADERS, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ key, value }),
    });
  } catch (e) {
    console.error("Erreur de sauvegarde", e);
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("App error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-semibold text-stone-800 mb-2">Erreur temporaire</h2>
          <p className="text-stone-500 text-sm text-center mb-2">Une erreur s'est produite. Clique sur Retour pour recommencer.</p>
          <p className="text-red-400 text-[10px] text-center mb-6 max-w-xs break-words">{this.state.error?.message || ""}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="bg-amber-700 text-white rounded-xl px-6 py-3 font-medium">
            ← Retour
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StockApp() {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [pins, setPins] = useState(DEFAULT_PINS);
  const [catalogue, setCatalogue] = useState(DEFAULT_CATALOGUE);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [cashRequests, setCashRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // full user object
  const [verified, setVerified] = useState(false);
  const [view, setView] = useState("home");

  // Derived convenience
  const isVladimir = currentUser?.name === "Vladimir";
  const role = isVladimir ? "manager" : (currentUser?.role || null);
  const currentEmployee = currentUser?.name || null;
  const employees = users.filter((u) => u.role === "employe").map((u) => u.name);

  useEffect(() => {
    (async () => {
      async function loadOrInit(key, fallback) {
        const res = await loadList(key, null);
        if (res !== null && res !== undefined) return res;
        await saveList(key, fallback);
        return fallback;
      }
      const [u, p, c, r, h, m] = await Promise.all([
        loadOrInit(EMPLOYEES_KEY, DEFAULT_USERS),
        loadOrInit(PINS_KEY, DEFAULT_PINS),
        loadOrInit(CATALOGUE_KEY, DEFAULT_CATALOGUE),
        loadOrInit(REQUESTS_KEY, []),
        loadOrInit(HISTORY_KEY, []),
        loadOrInit(CASH_KEY, []),
      ]);
      setUsers(u);
      setPins(p);
      setCatalogue(c);
      setRequests(r);
      setHistory(h);
      setCashRequests(m);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(async () => {
      const [r, h, c, u, p, m] = await Promise.all([
        loadList(REQUESTS_KEY, []),
        loadList(HISTORY_KEY, []),
        loadList(CATALOGUE_KEY, DEFAULT_CATALOGUE),
        loadList(EMPLOYEES_KEY, DEFAULT_USERS),
        loadList(PINS_KEY, DEFAULT_PINS),
        loadList(CASH_KEY, []),
      ]);
      if (r !== undefined) setRequests(r);
      if (h !== undefined) setHistory(h);
      if (c !== undefined) setCatalogue(c);
      if (u !== undefined) setUsers(u);
      if (p !== undefined) setPins(p);
      if (m !== undefined) setCashRequests(m);
    }, 4000);
    return () => clearInterval(id);
  }, [ready]);

  async function addRequest(articleId, quantite, nomLibre) {
    try {
      const newReq = { id: uid(), articleId: articleId || null, quantite, nomLibre: nomLibre || null, isNouveau: !articleId, par: currentEmployee, date: new Date().toISOString() };
      const updated = [...requests, newReq];
      setRequests(updated);
      await saveList(REQUESTS_KEY, updated);
    } catch(e) {
      console.error("addRequest error:", e);
    }
  }
  async function updateRequestQty(id, quantite) {
    const updated = requests.map((r) => (r.id === id ? { ...r, quantite } : r));
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function updateRequestComment(id, commentaire) {
    const updated = requests.map((r) => (r.id === id ? { ...r, commentaire } : r));
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function removeRequest(id) {
    const updated = requests.filter((r) => r.id !== id);
    setRequests(updated);
    await saveList(REQUESTS_KEY, updated);
  }
  async function validateOrder(selectedIds = null) {
    const toValidate = selectedIds ? requests.filter((r) => selectedIds.includes(r.id)) : requests;
    if (toValidate.length === 0) return;
    const remaining = selectedIds ? requests.filter((r) => !selectedIds.includes(r.id)) : [];
    const order = {
      id: uid(),
      date: new Date().toISOString(),
      articles: toValidate.map((r) => ({ ...r, recu: false })),
    };
    const updatedHistory = [order, ...history];
    setHistory(updatedHistory);
    setRequests(remaining);
    await Promise.all([saveList(HISTORY_KEY, updatedHistory), saveList(REQUESTS_KEY, remaining)]);
  }

  async function toggleReceived(orderId, articleId, actor, quantiteRecue) {
    const now = new Date().toISOString();
    let updatedHistory = history.map((order) =>
      order.id !== orderId
        ? order
        : {
            ...order,
            articles: order.articles.map((a) => {
              if (a.id !== articleId) return a;
              const partielle = quantiteRecue !== undefined && quantiteRecue < a.quantite;
              if (!a.recuPar) {
                return {
                  ...a,
                  recu: true,
                  recuPar: actor,
                  recuDate: now,
                  quantiteRecue: quantiteRecue !== undefined ? quantiteRecue : a.quantite,
                  livraisonPartielle: partielle,
                  manquant: partielle ? a.quantite - quantiteRecue : 0,
                };
              }
              return { ...a, recu: !a.recu, corrigePar: actor, corrigeDate: now };
            }),
          }
    );

    // If partial delivery, add a residual entry to history
    if (quantiteRecue !== undefined) {
      const origOrder = history.find(o => o.id === orderId);
      const origArticle = origOrder?.articles.find(a => a.id === articleId);
      if (origArticle && quantiteRecue < origArticle.quantite) {
        const manquant = origArticle.quantite - quantiteRecue;
        const origDate = origOrder.date;
        const dateLabel = new Date(origDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
        const resteEntry = {
          ...origArticle,
          id: uid(),
          quantite: manquant,
          recu: false,
          recuPar: null,
          recuDate: null,
          isReste: true,
          resteDepuis: dateLabel,
          date: now,
        };
        // Add to a new order entry so it shows in attente
        const resteOrder = {
          id: uid(),
          date: now,
          articles: [resteEntry],
        };
        updatedHistory = [resteOrder, ...updatedHistory];
      }
    }

    setHistory(updatedHistory);
    await saveList(HISTORY_KEY, updatedHistory);
  }

  async function updateHistoryComment(orderId, articleId, commentaire) {
    const updated = history.map((order) =>
      order.id !== orderId
        ? order
        : { ...order, articles: order.articles.map((a) => (a.id === articleId ? { ...a, commentaire } : a)) }
    );
    setHistory(updated);
    await saveList(HISTORY_KEY, updated);
  }

  async function clearHistory(dayLabel) {
    let updated;
    if (dayLabel) {
      // Delete only delivered orders from a specific day
      updated = history.filter(order => {
        const d = new Date(order.date);
        const label = d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
        const allReceived = order.articles.every(a => a.recu);
        return !(label === dayLabel && allReceived);
      });
    } else {
      // Delete only fully received orders
      updated = history.filter(order => !order.articles.every(a => a.recu));
    }
    setHistory(updated);
    await saveList(HISTORY_KEY, updated);
  }

  async function addCashRequest(lines, total, requester) {
    const newReq = { id: uid(), par: requester, date: new Date().toISOString(), lines, total, livre: false };
    const updated = [...cashRequests, newReq];
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function removeCashRequest(id) {
    const updated = cashRequests.filter((c) => c.id !== id);
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function toggleCashDelivered(id, actor) {
    const updated = cashRequests.map((c) => {
      if (c.id !== id) return c;
      const now = new Date().toISOString();
      if (!c.livrePar) {
        return { ...c, livre: true, livrePar: actor, livreDate: now };
      }
      return { ...c, livre: !c.livre, corrigePar: actor, corrigeDate: now };
    });
    setCashRequests(updated);
    await saveList(CASH_KEY, updated);
  }

  async function addCatalogueItem(item) {
    const updated = [...catalogue, { ...item, id: uid() }];
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function updateCatalogueItem(id, patch) {
    const updated = catalogue.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function removeCatalogueItem(id) {
    const updated = catalogue.filter((c) => c.id !== id);
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function renameCategory(oldName, newName) {
    if (!newName.trim() || oldName === newName) return;
    const updated = catalogue.map((c) => c.category === oldName ? { ...c, category: newName.trim() } : c);
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }
  async function renameSubcategory(category, oldSub, newSub) {
    if (!newSub.trim() || oldSub === newSub) return;
    const updated = catalogue.map((c) => (c.category === category && c.subcategory === oldSub) ? { ...c, subcategory: newSub.trim() } : c);
    setCatalogue(updated);
    await saveList(CATALOGUE_KEY, updated);
  }

  async function addUser(name, role) {
    const newUser = { id: uid(), name: name.trim(), role };
    const updatedUsers = [...users, newUser];
    const updatedPins = { ...pins, [newUser.id]: "1234" };
    setUsers(updatedUsers);
    setPins(updatedPins);
    await Promise.all([saveList(EMPLOYEES_KEY, updatedUsers), saveList(PINS_KEY, updatedPins)]);
    return newUser;
  }

  async function removeUser(userId) {
    const updatedUsers = users.filter((u) => u.id !== userId);
    const updatedPins = { ...pins };
    delete updatedPins[userId];
    setUsers(updatedUsers);
    setPins(updatedPins);
    await Promise.all([saveList(EMPLOYEES_KEY, updatedUsers), saveList(PINS_KEY, updatedPins)]);
  }

  async function changePin(userId, newPin) {
    const updatedPins = { ...pins, [userId]: newPin };
    setPins(updatedPins);
    await saveList(PINS_KEY, updatedPins);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-400 text-sm tracking-wide">Chargement…</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <UserSelect
        users={users}
        onSelect={(user) => setCurrentUser(user)}
      />
    );
  }

  if (!verified) {
    return (
      <PinEntry
        label={currentUser.name}
        correctPin={(pins && currentUser && pins[currentUser.id]) ? pins[currentUser.id] : "1234"}
        onSuccess={() => setVerified(true)}
        onBack={() => { setCurrentUser(null); setVerified(false); }}
      />
    );
  }

  // Safety checks - if user data is incomplete, show employee view
  if (!currentUser || !currentUser.name) {
    setCurrentUser(null);
    setVerified(false);
    return null;
  }

  const isManager = role === "manager";
  const isChef = role === "chef" || role === "manager";
  // Vladimir has full access but displays as regular employee

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-stone-50">
      <Header
        role={role}
        currentEmployee={currentEmployee}
        view={view}
        isChef={isChef}
        onBack={() => {
          setCurrentUser(null);
          setVerified(false);
          setView("home");
        }}
        onToggleCatalogue={() => setView(view === "catalogue" ? "home" : "catalogue")}
        onToggleUsers={() => setView(view === "users" ? "home" : "users")}
        isManager={isManager}
      />
      {(role === "employe" || !role) && currentEmployee !== "Vladimir" ? (
        <EmployeeView
          catalogue={catalogue}
          onAddRequest={addRequest}
          allRequests={requests}
          history={history}
          employees={employees}
          onToggleReceived={toggleReceived}
          onUpdateComment={updateRequestComment}
          onUpdateHistoryComment={updateHistoryComment}
          onRemoveRequest={removeRequest}
          onUpdateQty={updateRequestQty}
          currentEmployee={currentEmployee}
          currentUser={currentUser}
          pins={pins}
          onChangePin={changePin}
          myRequests={requests.filter((r) => r.par === currentEmployee)}
          cashRequests={cashRequests}
          onAddCashRequest={addCashRequest}
          onToggleCashDelivered={toggleCashDelivered}
          onRemoveCashRequest={removeCashRequest}
        />
      ) : view === "catalogue" ? (
        <CatalogueManager
          catalogue={catalogue}
          onAdd={addCatalogueItem}
          onUpdate={updateCatalogueItem}
          onRemove={removeCatalogueItem}
          onRenameCategory={renameCategory}
          onRenameSubcategory={renameSubcategory}
        />
      ) : view === "users" ? (
        <UserManager
          users={users}
          pins={pins}
          currentUser={currentUser}
          onAddUser={addUser}
          onRemoveUser={removeUser}
          onChangePin={changePin}
        />
      ) : (
        <ResponsableView
          requests={requests}
          history={history}
          catalogue={catalogue}
          employees={employees}
          onUpdateQty={updateRequestQty}
          onUpdateComment={updateRequestComment}
          onUpdateHistoryComment={updateHistoryComment}
          onRemove={removeRequest}
          onValidate={validateOrder}
          onToggleReceived={toggleReceived}
          onAddRequest={addRequest}
          onClearHistory={clearHistory}
          view={view}
          setView={setView}
          cashRequests={cashRequests}
          onToggleCashDelivered={toggleCashDelivered}
          onRemoveCashRequest={removeCashRequest}
          currentUser={currentUser}
          currentEmployee={currentEmployee}
          pins={pins}
          onChangePin={changePin}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}

function GustaveLogo({ size = 100 }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 180 120" className="mx-auto mb-4">
      <ellipse cx="90" cy="60" rx="86" ry="56" fill="#78350f" />
      <ellipse cx="90" cy="60" rx="86" ry="56" fill="none" stroke="#fef3c7" strokeWidth="2" />
      <ellipse cx="90" cy="60" rx="76" ry="47" fill="none" stroke="#fef3c7" strokeWidth="1" />
      <text x="90" y="42" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" letterSpacing="3" fill="#fef3c7">
        BRASSERIE
      </text>
      <text x="90" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" fontWeight="700" fill="#fef3c7">
        Chez Gustave
      </text>
      <line x1="55" y1="82" x2="125" y2="82" stroke="#fef3c7" strokeWidth="1" />
      <text x="90" y="97" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" letterSpacing="3.5" fill="#fef3c7">
        GENÈVE
      </text>
    </svg>
  );
}

function PinEntry({ label, correctPin, onSuccess, onBack }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function press(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === (correctPin || "1234")) {
        setTimeout(() => onSuccess(), 150);
      } else {
        setTimeout(() => { setError(true); setPin(""); }, 300);
      }
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <GustaveLogo />
      <p className="text-stone-500 text-sm mb-1">Code à 4 chiffres</p>
      <p className="font-semibold text-stone-800 mb-6">{label}</p>
      <div className="flex gap-3 mb-6">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < pin.length ? "bg-amber-700 border-amber-700" : "border-stone-300"} ${error ? "border-red-400" : ""}`} />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mb-4">Code incorrect, réessaie</p>}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button key={d} onClick={() => press(d)} className="w-16 h-16 rounded-full bg-white border border-stone-200 text-xl font-medium text-stone-700 hover:border-amber-400 active:bg-amber-50 transition-colors">{d}</button>
        ))}
        <div />
        <button onClick={() => press("0")} className="w-16 h-16 rounded-full bg-white border border-stone-200 text-xl font-medium text-stone-700 hover:border-amber-400 active:bg-amber-50 transition-colors">0</button>
        <button onClick={() => setPin((p) => p.slice(0,-1))} className="w-16 h-16 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600">⌫</button>
      </div>
      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600">← Retour</button>
    </div>
  );
}

function UserSelect({ users, onSelect }) {
  const roleOrder = { manager: 0, chef: 1, employe: 2 };
  const sorted = [...users].sort((a, b) => {
    const aOrder = a.role === "manager" && a.name !== "Vladimir" ? 0 : a.role === "chef" ? 1 : 2;
    const bOrder = b.role === "manager" && b.name !== "Vladimir" ? 0 : b.role === "chef" ? 1 : 2;
    return aOrder - bOrder;
  });

  function roleLabel(role) {
    if (role === "manager") return "Manager";
    if (role === "chef") return "Chef d'équipe";
    return "Employé";
  }
  function roleColor(role, name) {
    if (name === "Vladimir") return "bg-white border border-stone-200 text-stone-700";
    if (role === "manager") return "bg-stone-800 text-white";
    if (role === "chef") return "bg-amber-700 text-amber-50";
    return "bg-white border border-stone-200 text-stone-700";
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <GustaveLogo />
        <h1 className="text-2xl font-semibold text-stone-800">Chez Gustave Stock</h1>
        <p className="text-stone-500 text-sm mt-1">Qui es-tu aujourd'hui ?</p>
      </div>
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        {sorted.filter(u => u && u.id && u.name).map((user) => (
          <button key={user.id} onClick={() => onSelect({...user, role: user.role || "employe"})} className={`rounded-xl py-4 px-3 text-center font-medium shadow-sm hover:opacity-90 transition-opacity ${roleColor(user.role, user.name)}`}>
            <div>{user.name}</div>
            {user.role === "chef" && <div className="text-xs mt-0.5 text-amber-200">{roleLabel(user.role)}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ role, currentEmployee, onBack, onToggleCatalogue, onToggleUsers, view, isChef, isManager }) {
  function viewLabel() {
    if (view === "catalogue") return "Gérer le catalogue";
    if (view === "users") return "Gérer les utilisateurs";
    if (role === "employe") return currentEmployee;
    return "Gestion des commandes";
  }
  function roleLabel() {
    if (role === "manager" && currentEmployee !== "Vladimir") return "Manager";
    if (role === "chef") return "Chef d'équipe";
    return "Employé";
  }

  return (
    <div className="bg-white border-b border-stone-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {(view === "catalogue" || view === "users") && (
          <button onClick={view === "catalogue" ? onToggleCatalogue : onToggleUsers} className="text-stone-400 hover:text-stone-600">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <div className="text-xs text-stone-400 uppercase tracking-wide">{roleLabel()}</div>
          <div className="font-medium text-stone-800">{viewLabel()}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isChef && view !== "catalogue" && view !== "users" && (
          <button onClick={onToggleCatalogue} className="text-stone-400 hover:text-amber-700">
            <Settings size={18} />
          </button>
        )}
        {isChef && view !== "users" && view !== "catalogue" && (
          <button onClick={onToggleUsers} className="text-stone-400 hover:text-stone-700">
            <User size={18} />
          </button>
        )}
        <button onClick={onBack} className="text-xs text-stone-400 hover:text-stone-600 underline">Changer</button>
      </div>
    </div>
  );
}

// Group catalogue into { category: { subcategory: [items] } }
// Returns CSS class for article name based on groupe: black bold for Alimentaire, light brown for Non Alimentaire
function articleNameClass(item) {
  const groupe = item?.groupe || "Alimentaire";
  return groupe === "Non Alimentaire" ? "font-bold text-amber-600" : "font-bold text-stone-900";
}

function groupCatalogue(catalogue) {
  const tree = {};
  for (const item of (catalogue || [])) {
    if (!item) continue;
    if (item._placeholder) {
      // Ensure category/subcategory exist in tree but don't add the placeholder item
      const cat = item.category || "Sans catégorie";
      const sub = item.subcategory || "Général";
      if (!tree[cat]) tree[cat] = {};
      if (!tree[cat][sub]) tree[cat][sub] = [];
      continue;
    }
    const cat = item.category || "Sans catégorie";
    const sub = item.subcategory || "Général";
    if (!tree[cat]) tree[cat] = {};
    if (!tree[cat][sub]) tree[cat][sub] = [];
    tree[cat][sub].push(item);
  }
  return tree;
}

// Returns the groupe (Alimentaire / Non Alimentaire) a category belongs to, based on existing items
function categoryGroupe(catalogue, category) {
  const item = catalogue.find((c) => c.category === category && c.groupe);
  return item ? item.groupe : "Alimentaire";
}

// List of distinct categories belonging to a given groupe
function categoriesForGroupe(catalogue, groupe) {
  const cats = new Set();
  for (const item of catalogue) {
    if ((item.groupe || "Alimentaire") === groupe) cats.add(item.category || "Sans catégorie");
  }
  return [...cats].sort();
}

function EmployeeView({ catalogue, onAddRequest, allRequests, history, employees, onToggleReceived, onUpdateComment, onUpdateHistoryComment, onRemoveRequest, onUpdateQty, currentEmployee, currentUser, pins, onChangePin, myRequests, cashRequests, onAddCashRequest, onToggleCashDelivered, onRemoveCashRequest }) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [openCat, setOpenCat] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [sent, setSent] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(null); // { matches: [] }
  const [tab, setTab] = useState("nouvelle");
  const [showCashForm, setShowCashForm] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [showAutre, setShowAutre] = useState(false); // "Alimentaire" | "Non Alimentaire"

  const filteredCatalogue = selectedGroupe ? catalogue.filter((c) => (c.groupe || "Alimentaire") === selectedGroupe) : [];
  const tree = groupCatalogue(filteredCatalogue);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  // Count articles validated but not yet received
  const pendingDeliveryCount = history.reduce((sum, order) =>
    sum + order.articles.filter((a) => !a.recu).length, 0
  );

  function findRecentMatches(articleId) {
    const now = Date.now();
    const matches = [];

    // Pending requests from other employees
    for (const r of allRequests) {
      if (r.articleId === articleId && r.par !== currentEmployee) {
        matches.push({ par: r.par, date: r.date, quantite: r.quantite, statut: "en attente" });
      }
    }

    // Validated orders within the last 3 days
    for (const order of history) {
      for (const a of order.articles) {
        if (a.articleId === articleId && now - new Date(a.date).getTime() <= THREE_DAYS_MS) {
          matches.push({ par: a.par, date: a.date, quantite: a.quantite, statut: "commandé" });
        }
      }
    }

    // Most recent first
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    return matches;
  }

  function attemptSubmit() {
    if (!selected || !qty || Number(qty) <= 0) return;
    const matches = findRecentMatches(selected.id);
    if (matches.length > 0) {
      setDuplicateModal({ matches });
    } else {
      doSubmit();
    }
  }

  function doSubmit() {
    if (!selected) return;
    onAddRequest(selected.id, Number(qty) || 1);
    setSelected(null);
    setQty("1");
    setDuplicateModal(null);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }


  return (
    <div className="max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2 p-3 bg-stone-100 sticky top-[65px] z-10">
        <button onClick={() => setTab("nouvelle")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "nouvelle" ? "bg-amber-700 text-white shadow-md" : "bg-white text-amber-700 border border-amber-200"}`}>
          🛒<br/>Nouvelle<br/>commande
        </button>
        <button onClick={() => setTab("panier")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "panier" ? "bg-teal-600 text-white shadow-md" : "bg-white text-teal-600 border border-teal-200"}`}>
          🧺<br/>Panier<br/>{allRequests.length > 0 ? `(${allRequests.length})` : "commun"}
        </button>
        <button onClick={() => setTab("historique")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${tab === "historique" ? "bg-orange-500 text-white shadow-md" : "bg-white text-orange-500 border border-orange-200"}`}>
          ⏳<br/>En attente<br/>livraison
          {pendingDeliveryCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border-2 border-white">
              {pendingDeliveryCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab("livre")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "livre" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-emerald-600 border border-emerald-200"}`}>
          ✅<br/>Historique
        </button>
        <button onClick={() => setTab("monnaie")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "monnaie" ? "bg-red-600 text-white shadow-md" : "bg-white text-red-600 border border-red-200"}`}>
          💰<br/>Monnaie
        </button>
        <button onClick={() => setTab("profil")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${tab === "profil" ? "bg-stone-700 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          👤<br/>Mon<br/>profil
        </button>
      </div>

      {tab === "profil" ? (
        <div className="p-5 max-w-md mx-auto">
          <ProfilView currentUser={currentUser} pins={pins} onChangePin={onChangePin} />
        </div>
      ) : tab === "monnaie" ? (
        <div className="p-5">
          <CashList
            cashRequests={cashRequests}
            employees={employees}
            currentIdentity={currentEmployee}
            onToggleDelivered={onToggleCashDelivered}
            onRemove={onRemoveCashRequest}
          />
        </div>
      ) : tab === "panier" ? (
        <div className="p-5">
          <PanierCommun
            allRequests={allRequests}
            catalogue={catalogue}
            onUpdateComment={onUpdateComment}
            onRemoveRequest={onRemoveRequest}
            onUpdateQty={onUpdateQty}
          />
        </div>
      ) : tab === "historique" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity={currentEmployee}
              mode="attente"
            />
          )}
        </div>
      ) : tab === "livre" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity={currentEmployee}
              mode="livre"
            />
          )}
        </div>
      ) : (
        <div className="p-5">
      {sent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 max-w-[90vw]">
          <span className="text-2xl">😊</span>
          <span className="text-sm font-medium">Demande bien enregistrée !</span>
        </div>
      )}

      {duplicateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Déjà demandé récemment</h3>
              <p className="text-sm text-stone-500">
                "<span className="font-medium text-stone-700">{selected?.name}</span>" a déjà été signalé ces 3
                derniers jours :
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-3 mb-5 space-y-2 max-h-40 overflow-y-auto">
              {duplicateModal.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-stone-700">{m.par}</span>
                    <span className="text-stone-400"> · x{m.quantite}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-400">
                      {new Date(m.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
                    </div>
                    <div className={`text-[10px] ${m.statut === "commandé" ? "text-emerald-600" : "text-amber-600"}`}>
                      {m.statut}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-stone-500 text-center mb-4">Veux-tu envoyer ta demande quand même ?</p>

            <div className="flex gap-2">
              <button
                onClick={() => setDuplicateModal(null)}
                className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAutre ? (
        <AutreArticleView
          onSubmit={(items) => {
            items.forEach(item => onAddRequest(null, item.quantite, item.nom));
            setShowAutre(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
          }}
          onBack={() => setShowAutre(false)}
        />
      ) : !selectedGroupe ? (
        <>
          <h2 className="text-stone-700 font-medium mb-3 text-sm">Quel type de produit ?</h2>
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              onClick={() => setSelectedGroupe("Alimentaire")}
              className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              🧃 Alimentaires
            </button>
            <button
              onClick={() => setSelectedGroupe("Non Alimentaire")}
              className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              🥡 Non Alimentaires
            </button>
            <button
              onClick={() => { setShowAutre(true); setSelectedGroupe(null); }}
              className="bg-white border-2 border-dashed border-stone-300 rounded-xl py-5 text-center font-medium text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm"
            >
              ➕ Autre<br/>
              <span className="text-xs font-normal text-stone-400">Article non répertorié</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-700 font-medium text-sm">
              {selectedGroupe === "Alimentaire" ? "🧃 Alimentaires" : "🥡 Non Alimentaires"}
            </h2>
            <button
              onClick={() => {
                setSelectedGroupe(null);
                setSelected(null);
                setOpenCat(null);
                setOpenSub(null);
              }}
              className="text-xs text-amber-700 underline"
            >
              Changer
            </button>
          </div>

      <div className="space-y-2 mb-6">
        {Object.entries(tree).map(([cat, subs]) => (
          <div key={cat} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenCat(openCat === cat ? null : cat)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800"
            >
              {cat}
              <ChevronDown
                size={16}
                className={`text-stone-400 transition-transform ${openCat === cat ? "rotate-180" : ""}`}
              />
            </button>
            {openCat === cat && (
              <div className="px-2 pb-2">
                {Object.entries(subs).map(([sub, items]) => (
                  <div key={sub} className="mb-1">
                    <button
                      onClick={() => setOpenSub(openSub === sub ? null : sub)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-stone-400"
                    >
                      {sub}
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${openSub === sub ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSub === sub && (
                      <div className="flex flex-col gap-2 px-3 pb-2">
                        {items.map((item) => (
                          <div key={item.id}>
                            <button
                              onClick={() => {
                                if (selected?.id === item.id) {
                                  setSelected(null);
                                } else {
                                  setSelected(item);
                                  setQty("1");
                                }
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                                selected?.id === item.id
                                  ? "bg-amber-700 text-amber-50 border-amber-700"
                                  : "bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                {selected?.id === item.id && <ChevronDown size={14} className="rotate-180" />}
                              </div>
                              <div className={`text-[10px] mt-0.5 ${selected?.id === item.id ? "text-amber-100" : "text-stone-400"}`}>
                                {item.code ? `${item.code} · ` : ""}{item.minStock ? `Min: ${item.minStock} ${item.minUnit || ''}` : ""}
                              </div>
                            </button>

                            {selected?.id === item.id && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1 flex items-center gap-3">
                                <span className="text-xs text-stone-500 shrink-0">Quantité</span>
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    onClick={() => setQty((q) => String(Math.max(1, Number(q) - 1)))}
                                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    className="w-12 text-center border border-stone-200 rounded-lg py-1 text-sm"
                                  />
                                  <button
                                    onClick={() => setQty((q) => String(Number(q) + 1))}
                                    className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={attemptSubmit}
                                  className="bg-amber-700 text-amber-50 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-800 transition-colors shrink-0"
                                >
                                  Envoyer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      )}

      {myRequests.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Mes demandes en attente</h3>
          <div className="space-y-2">
            {myRequests.filter(r => r && r.id).map((r) => {
              let item = null, nom = "Article";
              try {
                item = r.articleId ? catalogue.find((c) => c.id === r.articleId) : null;
                nom = r.isNouveau ? (r.nomLibre || "Article libre") : (item ? item.name : "Article supprimé");
              } catch(e) { nom = r.nomLibre || "Article"; }
              return (
                <div
                  key={r.id}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm"
                >
                  <span className="text-stone-700">{nom}</span>
                  <span className="text-stone-400">x{r.quantite}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowCashForm(!showCashForm)}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-4 font-bold text-base tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          💰 DEMANDE DE MONNAIE
        </button>

        {showCashForm && (
          <CashRequestForm
            currentEmployee={currentEmployee}
            onSubmit={(lines, total) => {
              onAddCashRequest(lines, total, currentEmployee);
              setShowCashForm(false);
            }}
            onCancel={() => setShowCashForm(false)}
          />
        )}
      </div>
        </div>
      )}
    </div>
  );
}


function AutreArticleView({ onSubmit, onBack }) {
  const [items, setItems] = useState([{ id: uid(), nom: "", quantite: 1 }]);

  function addLine() {
    setItems(prev => [...prev, { id: uid(), nom: "", quantite: 1 }]);
  }
  function updateLine(id, field, value) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }
  function removeLine(id) {
    if (items.length === 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }
  function handleSubmit() {
    const valid = items.filter(i => i.nom.trim());
    if (valid.length === 0) return;
    onSubmit(valid);
  }

  return (
    <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700">➕ Article non répertorié</h3>
      </div>
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              value={item.nom}
              onChange={(e) => updateLine(item.id, "nom", e.target.value)}
              placeholder="Nom de l'article..."
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-1">
              <button onClick={() => updateLine(item.id, "quantite", Math.max(1, item.quantite - 1))} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center">−</button>
              <span className="w-6 text-center text-sm font-medium">{item.quantite}</span>
              <button onClick={() => updateLine(item.id, "quantite", item.quantite + 1)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center">+</button>
            </div>
            {items.length > 1 && (
              <button onClick={() => removeLine(item.id)} className="text-stone-300 hover:text-red-500"><Trash2 size={14} /></button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addLine} className="text-xs text-amber-700 underline mb-3 flex items-center gap-1"><Plus size={12} /> Ajouter un autre article</button>
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-none bg-stone-100 text-stone-600 rounded-xl py-3 px-5 font-medium hover:bg-stone-200 transition-colors">← Retour</button>
        <button onClick={handleSubmit} className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors">Envoyer</button>
      </div>
    </div>
  );
}

function PanierCommun({ allRequests, catalogue, onUpdateComment, onRemoveRequest, onUpdateQty }) {
  const [commentOpenId, setCommentOpenId] = useState(null);
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(13, 30, 0, 0);
  const minutesLeft = Math.round((deadline - now) / 60000);
  const isPast = minutesLeft < 0;

  // Group by category
  const byCategory = {};
  const safeRequests = (allRequests || []).filter(r => r && r.id && r.par && r.quantite);
  for (const r of safeRequests) {
    try {
      const item = r.articleId ? catalogue.find((c) => c.id === r.articleId) : null;
      const cat = item?.category || (r.isNouveau ? "Autres articles" : "Sans catégorie");
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ ...r, item });
    } catch(e) { console.error("PanierCommun item error:", e); }
  }
  // Distinct people who have contributed
  const contributors = [...new Set(allRequests.map((r) => r.par))];

  return (
    <div>
      <div
        className={`rounded-xl p-4 mb-5 text-sm ${
          isPast ? "bg-stone-100 text-stone-500" : "bg-amber-50 border border-amber-200 text-amber-700"
        }`}
      >
        {isPast ? (
          <>L'heure limite de 13h30 est passée pour aujourd'hui.</>
        ) : (
          <>
            ⏰ Envoyez vos demandes avant <span className="font-semibold">13h30</span> — encore{" "}
            <span className="font-semibold">{minutesLeft} min</span>. Idéalement, tout le monde envoie en même
            temps pour ne faire qu'une seule commande.
          </>
        )}
      </div>

      {contributors.length > 0 && (
        <div className="text-xs text-stone-400 mb-4">
          Ont déjà ajouté quelque chose : <span className="text-stone-600 font-medium">{contributors.join(", ")}</span>
        </div>
      )}

      {allRequests.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          <ClipboardList className="mx-auto mb-2" size={28} />
          Personne n'a encore rien ajouté
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-xs font-semibold text-stone-500 mb-1">{cat}</div>
              <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
                {items.map((r) => (
                  <div key={r.id} className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span className="flex-1 flex items-center gap-1 flex-wrap">
                        {r.isNouveau ? (
                          <>
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                            <span className="font-bold text-stone-900">{r.nomLibre || "Article libre"}</span>
                          </>
                        ) : (
                          <><span className="text-stone-400 font-normal">{r.item?.code ? `${r.item.code} · ` : ""}</span><span className={articleNameClass(r.item)}>{r.item ? r.item.name : "Article supprimé"}</span></>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                      <button onClick={() => onUpdateQty && onUpdateQty(r.id, Math.max(1, r.quantite - 1))} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm">−</button>
                      <span className="text-stone-700 font-medium text-sm w-6 text-center">{r.quantite}</span>
                      <button onClick={() => onUpdateQty && onUpdateQty(r.id, r.quantite + 1)} className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm">+</button>
                    </div>
                    </div>
                    <div className="pl-6 mt-1">
                      {r.commentaire ? (
                        <button
                          onClick={() => setCommentOpenId(commentOpenId === r.id ? null : r.id)}
                          className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                        >
                          💬 {r.commentaire}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCommentOpenId(commentOpenId === r.id ? null : r.id)}
                          className="text-xs text-stone-400 underline"
                        >
                          + Ajouter un commentaire
                        </button>
                      )}
                      {commentOpenId === r.id && (
                        <CommentEditor
                          value={r.commentaire || ""}
                          onSave={(text) => {
                            onUpdateComment && onUpdateComment(r.id, text);
                            setCommentOpenId(null);
                          }}
                          onCancel={() => setCommentOpenId(null)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CashRequestForm({ currentEmployee, onSubmit, onCancel }) {
  const [qtys, setQtys] = useState({}); // { denomId: quantity }

  function setQty(id, value) {
    const n = Math.max(0, Number(value) || 0);
    setQtys((prev) => ({ ...prev, [id]: n }));
  }

  const lines = DENOMINATIONS.map((d) => ({
    ...d,
    qty: qtys[d.id] || 0,
    subtotal: (qtys[d.id] || 0) * d.value,
  }));
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const rouleaux = lines.filter((l) => l.type === "rouleau");
  const billets = lines.filter((l) => l.type === "billet");

  function submit() {
    const selected = lines.filter((l) => l.qty > 0).map(({ id, type, value, label, qty, subtotal }) => ({ id, type, value, label, qty, subtotal }));
    if (selected.length === 0) return;
    onSubmit(selected, total);
  }

  function renderRow(l) {
    return (
      <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
        <span className="text-sm text-stone-700">{l.label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={qtys[l.id] || ""}
            onChange={(e) => setQty(l.id, e.target.value)}
            placeholder="0"
            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-center text-sm"
          />
          <span className="text-xs text-stone-400 w-16 text-right">
            {l.subtotal > 0 ? `${l.subtotal.toFixed(2)} CHF` : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-red-200 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-red-700 mb-3">💰 Demande de monnaie — {currentEmployee}</h3>

      <div className="mb-3">
        <div className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Rouleaux</div>
        {rouleaux.map(renderRow)}
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-wide">Billets</div>
        {billets.map(renderRow)}
      </div>

      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
        <span className="text-sm font-semibold text-red-700">Total global</span>
        <span className="text-lg font-bold text-red-700">{total.toFixed(2)} CHF</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={total === 0}
          className="flex-1 bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 disabled:opacity-40 transition-colors"
        >
          Envoyer la demande
        </button>
      </div>
    </div>
  );
}

function CashList({ cashRequests, employees, currentIdentity, onToggleDelivered, onRemove }) {
  const sorted = [...cashRequests].sort((a, b) => new Date(b.date) - new Date(a.date));
  const pending = sorted.filter((c) => !c.livre);
  const delivered = sorted.filter((c) => c.livre);

  function renderCard(c) {
    return (
      <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-sm font-medium text-stone-800">{c.par}</div>
            <div className="text-xs text-stone-400">
              {new Date(c.date).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <span className="text-base font-bold text-red-700">{c.total.toFixed(2)} CHF</span>
        </div>

        <div className="space-y-0.5 mb-3">
          {c.lines.map((l) => (
            <div key={l.id} className="flex justify-between text-xs text-stone-500">
              <span>{l.label} × {l.qty}</span>
              <span>{l.subtotal.toFixed(2)} CHF</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleDelivered(c.id, currentIdentity || "Inconnu")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              c.livre
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-stone-200 text-stone-500 hover:border-amber-400"
            }`}
          >
            <Check size={13} />
            {c.livre ? "Livré" : "Marquer comme livré"}
          </button>
          {!c.livre && onRemove && (
            <button onClick={() => onRemove(c.id)} className="text-stone-300 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {c.livrePar && (
          <div className="text-[11px] text-stone-400 mt-2">
            Livré par <span className="font-medium text-emerald-600">{c.livrePar}</span>
            {c.livreDate && <> le {new Date(c.livreDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>}
            {c.corrigePar && (
              <>
                {" "}
                · <span className="font-medium text-orange-600">
                  {c.livre ? "Re-confirmé" : "Corrigé (non livré)"} par {c.corrigePar}
                </span>
                {c.corrigeDate && <> le {new Date(c.corrigeDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (cashRequests.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400 text-sm">
        <ClipboardList className="mx-auto mb-2" size={28} />
        Aucune demande de monnaie
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
            En attente de livraison ({pending.length})
          </div>
          <div className="space-y-3">{pending.map(renderCard)}</div>
        </div>
      )}
      {delivered.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Livrées ({delivered.length})
          </div>
          <div className="space-y-3">{delivered.map(renderCard)}</div>
        </div>
      )}
    </div>
  );
}

function PinChanger({ userId, currentPin, onSave, onCancel }) {
  const [step, setStep] = useState("old"); // "old" | "new" | "confirm"
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  function press(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError("");
    if (next.length === 4) {
      setTimeout(() => {
        if (step === "old") {
          if (next !== currentPin) { setError("Code actuel incorrect"); setPin(""); return; }
          setStep("new"); setPin("");
        } else if (step === "new") {
          setNewPin(next); setStep("confirm"); setPin("");
        } else {
          if (next !== newPin) { setError("Les codes ne correspondent pas"); setPin(""); setStep("new"); setNewPin(""); return; }
          onSave(next);
        }
      }, 150);
    }
  }

  const labels = { old: "Code actuel", new: "Nouveau code", confirm: "Confirmer le nouveau code" };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl text-center">
        <h3 className="font-semibold text-stone-800 mb-1">Changer mon code</h3>
        <p className="text-sm text-stone-500 mb-4">{labels[step]}</p>
        <div className="flex gap-3 justify-center mb-4">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${i < pin.length ? "bg-amber-700 border-amber-700" : "border-stone-300"}`} />
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <button key={d} onClick={() => press(d)} className="h-12 rounded-xl bg-stone-50 border border-stone-200 text-lg font-medium text-stone-700 hover:border-amber-400">{d}</button>
          ))}
          <div />
          <button onClick={() => press("0")} className="h-12 rounded-xl bg-stone-50 border border-stone-200 text-lg font-medium text-stone-700 hover:border-amber-400">0</button>
          <button onClick={() => setPin((p) => p.slice(0,-1))} className="h-12 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600">⌫</button>
        </div>
        <button onClick={onCancel} className="text-sm text-stone-400 hover:text-stone-600">Annuler</button>
      </div>
    </div>
  );
}

function ProfilView({ currentUser, pins, onChangePin }) {
  const [showPinChanger, setShowPinChanger] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div>
      {showPinChanger && (
        <PinChanger
          userId={currentUser.id}
          currentPin={pins[currentUser.id] || "1234"}
          onSave={async (newPin) => {
            await onChangePin(currentUser.id, newPin);
            setShowPinChanger(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
          }}
          onCancel={() => setShowPinChanger(false)}
        />
      )}
      <div className="bg-white border border-stone-200 rounded-xl p-5 text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <User className="text-amber-700" size={24} />
        </div>
        <div className="font-semibold text-stone-800 text-lg">{currentUser.name}</div>
        <div className="text-xs text-stone-400 mt-0.5">
          {currentUser.role === "manager" ? "Manager" : currentUser.role === "chef" ? "Chef d'équipe" : "Employé"}
        </div>
      </div>

      {success && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">Code PIN mis à jour !</span>
        </div>
      )}

      <button
        onClick={() => setShowPinChanger(true)}
        className="w-full bg-white border border-stone-200 rounded-xl py-4 text-sm font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center justify-center gap-2"
      >
        🔑 Changer mon code PIN
      </button>
    </div>
  );
}

function UserManager({ users, pins, currentUser, onAddUser, onRemoveUser, onChangePin }) {
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("employe");
  const [changingPinFor, setChangingPinFor] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const roleLabel = { employe: "Employé", chef: "Chef d'équipe", manager: "Manager" };
  const roleColor = { employe: "text-stone-600 bg-stone-100", chef: "text-amber-700 bg-amber-50", manager: "text-white bg-stone-800" };

  async function handleAdd() {
    if (!newName.trim()) return;
    await onAddUser(newName.trim(), newRole);
    setNewName("");
    setNewRole("employe");
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      {changingPinFor && (
        <PinChanger
          userId={changingPinFor.id}
          currentPin={pins[changingPinFor.id] || "1234"}
          onSave={async (newPin) => { await onChangePin(changingPinFor.id, newPin); setChangingPinFor(null); }}
          onCancel={() => setChangingPinFor(null)}
        />
      )}
      {confirmRemove && (
        <ConfirmDialog
          title="Supprimer cet utilisateur ?"
          message={`"${confirmRemove.name}" sera retiré définitivement.`}
          onCancel={() => setConfirmRemove(null)}
          onConfirm={async () => { await onRemoveUser(confirmRemove.id); setConfirmRemove(null); }}
        />
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Ajouter un utilisateur</h3>
        <div className="space-y-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Prénom"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="employe">Employé</option>
            <option value="chef">Chef d'équipe</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Ajouter (Code PIN: 1234 par défaut)
          </button>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Utilisateurs</h3>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-800 text-sm">{u.name}</div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] || "text-stone-500 bg-stone-100"}`}>
                {roleLabel[u.role] || u.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChangingPinFor(u)}
                className="text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded-lg px-2 py-1"
              >
                🔑 PIN
              </button>
              {u.id !== currentUser.id && (
                <button onClick={() => setConfirmRemove(u)} className="text-stone-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <Trash2 className="text-red-600" size={20} />
          </div>
          <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
          <p className="text-sm text-stone-500">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium hover:bg-stone-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentEditor({ value, onSave, onCancel }) {
  const presets = ["Rupture stock", "Livraison tardive", "Plus référencé"];

  // Parse existing value to separate base text from an appended date, if any
  const dateMatch = value.match(/ \(prévue le (\d{4}-\d{2}-\d{2})\)$/);
  const initialText = dateMatch ? value.slice(0, dateMatch.index) : value;
  const initialDate = dateMatch ? dateMatch[1] : "";

  const [text, setText] = useState(initialText);
  const [lateDate, setLateDate] = useState(initialDate);

  const isLate = text === "Livraison tardive";

  function buildFinalText() {
    const base = text.trim();
    if (!base) return "";
    if (isLate && lateDate) {
      return `${base} (prévue le ${lateDate})`;
    }
    return base;
  }

  return (
    <div className="mt-2 bg-stone-50 border border-stone-200 rounded-xl p-3">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setText(p)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              text === p
                ? "bg-amber-700 text-amber-50 border-amber-700"
                : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {isLate && (
        <div className="mb-2">
          <label className="text-xs text-stone-500 mb-1 block">Date de livraison prévue</label>
          <input
            type="date"
            value={lateDate}
            onChange={(e) => setLateDate(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Commentaire libre…"
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 border border-stone-200 text-stone-500 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-100"
        >
          Annuler
        </button>
        <button
          onClick={() => onSave(buildFinalText())}
          className="flex-1 bg-amber-700 text-amber-50 rounded-lg py-1.5 text-xs font-medium hover:bg-amber-800"
        >
          Enregistrer
        </button>
        {value && (
          <button
            onClick={() => onSave("")}
            className="text-xs text-red-500 px-2"
            title="Supprimer le commentaire"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ChefCommandeView({ catalogue, allRequests, onAddRequest, currentEmployee, myRequests }) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [openCat, setOpenCat] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [sent, setSent] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const [showAutreChef, setShowAutreChef] = useState(false);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  const filteredCatalogue = selectedGroupe ? catalogue.filter((c) => (c.groupe || "Alimentaire") === selectedGroupe) : [];
  const tree = groupCatalogue(filteredCatalogue);

  function findRecentMatches(articleId) {
    const now = Date.now();
    const matches = [];
    for (const r of allRequests) {
      if (r.articleId === articleId && r.par !== currentEmployee) {
        matches.push({ par: r.par, date: r.date, quantite: r.quantite, statut: "en attente" });
      }
    }
    matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    return matches;
  }

  function attemptSubmit() {
    if (!selected || !qty || Number(qty) <= 0) return;
    const matches = findRecentMatches(selected.id);
    if (matches.length > 0) {
      setDuplicateModal({ matches });
    } else {
      doSubmit();
    }
  }

  function doSubmit() {
    if (!selected) return;
    onAddRequest(selected.id, Number(qty) || 1);
    setSelected(null);
    setQty("1");
    setDuplicateModal(null);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="max-w-md mx-auto p-5">
      {sent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 max-w-[90vw]">
          <span className="text-2xl">😊</span>
          <span className="text-sm font-medium">Ajouté à la liste en attente !</span>
        </div>
      )}

      {duplicateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1">Déjà demandé récemment</h3>
              <p className="text-sm text-stone-500">"{selected?.name}" a déjà été signalé :</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 mb-5 space-y-2 max-h-40 overflow-y-auto">
              {duplicateModal.matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div><span className="font-medium text-stone-700">{m.par}</span><span className="text-stone-400"> · x{m.quantite}</span></div>
                  <div className="text-xs text-stone-400">{new Date(m.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDuplicateModal(null)} className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 font-medium">Annuler</button>
              <button onClick={doSubmit} className="flex-1 bg-amber-700 text-amber-50 rounded-xl py-3 font-medium">Continuer</button>
            </div>
          </div>
        </div>
      )}

      {showAutreChef ? (
        <AutreArticleView
          onSubmit={(items) => {
            items.forEach(item => onAddRequest(null, item.quantite, item.nom));
            setShowAutreChef(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
          }}
          onBack={() => setShowAutreChef(false)}
        />
      ) : !selectedGroupe ? (
        <>
          <h2 className="text-stone-700 font-medium mb-3 text-sm">Quel type de produit ?</h2>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setSelectedGroupe("Alimentaire")} className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">🧃 Alimentaires</button>
            <button onClick={() => setSelectedGroupe("Non Alimentaire")} className="bg-white border border-stone-200 rounded-xl py-5 text-center font-medium text-stone-700 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">🥡 Non Alimentaires</button>
            <button onClick={() => { setShowAutreChef(true); setSelectedGroupe(null); }} className="bg-white border-2 border-dashed border-stone-300 rounded-xl py-5 text-center font-medium text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-sm">➕ Autre<div className="text-xs font-normal text-stone-400 mt-1">Article non répertorié</div></button>
          </div>
        </>
      ) : showAutreChef ? (
        <AutreArticleView
          onSubmit={(items) => {
            items.forEach(item => onAddRequest(null, item.quantite, item.nom));
            setShowAutreChef(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
          }}
          onBack={() => setShowAutreChef(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-stone-700 font-medium text-sm">{selectedGroupe === "Alimentaire" ? "🧃 Alimentaires" : "🥡 Non Alimentaires"}</h2>
            <button onClick={() => { setSelectedGroupe(null); setSelected(null); setOpenCat(null); setOpenSub(null); }} className="text-xs text-amber-700 underline">Changer</button>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(tree).map(([cat, subs]) => (
              <div key={cat} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenCat(openCat === cat ? null : cat)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-800">
                  {cat}
                  <ChevronDown size={16} className={`text-stone-400 transition-transform ${openCat === cat ? "rotate-180" : ""}`} />
                </button>
                {openCat === cat && (
                  <div className="px-2 pb-2">
                    {Object.entries(subs).map(([sub, items]) => (
                      <div key={sub} className="mb-1">
                        <button onClick={() => setOpenSub(openSub === sub ? null : sub)} className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-stone-400">
                          {sub}
                          <ChevronDown size={12} className={`transition-transform ${openSub === sub ? "rotate-180" : ""}`} />
                        </button>
                        {openSub === sub && (
                          <div className="flex flex-col gap-2 px-3 pb-2">
                            {items.map((item) => (
                              <div key={item.id}>
                                <button
                                  onClick={() => { if (selected?.id === item.id) { setSelected(null); } else { setSelected(item); setQty("1"); } }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${selected?.id === item.id ? "bg-amber-700 text-amber-50 border-amber-700" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-300"}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    {selected?.id === item.id && <ChevronDown size={14} className="rotate-180" />}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 ${selected?.id === item.id ? "text-amber-100" : "text-stone-400"}`}>{item.code ? `${item.code} · ` : ""}{item.minStock ? `Min: ${item.minStock} ${item.minUnit || ''}` : ""}</div>
                                </button>
                                {selected?.id === item.id && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1 flex items-center gap-3">
                                    <span className="text-xs text-stone-500 shrink-0">Quantité</span>
                                    <div className="flex items-center gap-2 ml-auto">
                                      <button onClick={() => setQty((q) => String(Math.max(1, Number(q) - 1)))} className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400">−</button>
                                      <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-12 text-center border border-stone-200 rounded-lg py-1 text-sm" />
                                      <button onClick={() => setQty((q) => String(Number(q) + 1))} className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 font-medium flex items-center justify-center hover:border-amber-400">+</button>
                                    </div>
                                    <button onClick={attemptSubmit} className="bg-amber-700 text-amber-50 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-800 shrink-0">Ajouter</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {myRequests.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Mes ajouts en attente</h3>
          <div className="space-y-2">
            {myRequests.filter(r => r && r.id).map((r) => {
              let item = null, nom = "Article";
              try {
                item = r.articleId ? catalogue.find((c) => c.id === r.articleId) : null;
                nom = r.isNouveau ? (r.nomLibre || "Article libre") : (item ? item.name : "Article supprimé");
              } catch(e) { nom = r.nomLibre || "Article"; }
              return (
                <div key={r.id} className="bg-white border border-stone-200 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{nom}</span>
                  <span className="text-stone-400">x{r.quantite}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResponsableView({ requests, history, catalogue, employees, onUpdateQty, onUpdateComment, onUpdateHistoryComment, onRemove, onValidate, onToggleReceived, onAddRequest, onClearHistory, view, setView, cashRequests, onToggleCashDelivered, onRemoveCashRequest, currentUser, currentEmployee, pins, onChangePin }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [commentOpenId, setCommentOpenId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [showPinChanger, setShowPinChanger] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false); // { id, label }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    setSelectedIds(requests.map((r) => r.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  return (
    <div className="max-w-md mx-auto">
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cette demande ?"
          message={`"${confirmDelete.label}" sera retiré définitivement de la liste en attente.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onRemove(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      <div className="grid grid-cols-3 gap-2 p-3 bg-stone-100 sticky top-[65px] z-10">
        <button onClick={() => setView("nouvelle")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${view === "nouvelle" ? "bg-amber-700 text-white shadow-md" : "bg-white text-amber-700 border border-amber-200"}`}>
          🛒<br/>Nouvelle<br/>commande
        </button>
        <button onClick={() => setView("home")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "home" ? "bg-orange-500 text-white shadow-md" : "bg-white text-orange-500 border border-orange-200"}`}>
          ⏳<br/>En attente
          {requests.length > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border border-white">
              {requests.length}
            </span>
          )}
        </button>
        <button onClick={() => setView("history")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "history" ? "bg-yellow-500 text-white shadow-md" : "bg-white text-yellow-600 border border-yellow-200"}`}>
          📦<br/>Validée en<br/>attente
          {history.reduce((sum, o) => sum + o.articles.filter((a) => !a.recu).length, 0) > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border-2 border-white">
              {history.reduce((sum, o) => sum + o.articles.filter((a) => !a.recu).length, 0)}
            </span>
          )}
        </button>
        <button onClick={() => setView("livre")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "livre" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-emerald-600 border border-emerald-200"}`}>
          ✅<br/>Historique
        </button>
        <button onClick={() => setView("monnaie")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all relative ${view === "monnaie" ? "bg-red-600 text-white shadow-md" : "bg-white text-red-600 border border-red-200"}`}>
          💰<br/>Monnaie
          {cashRequests.filter((c) => !c.livre).length > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 border border-white">
              {cashRequests.filter((c) => !c.livre).length}
            </span>
          )}
        </button>
        <button onClick={() => setView("profil")} className={`rounded-xl py-3 px-1 text-center text-xs font-semibold transition-all ${view === "profil" ? "bg-stone-700 text-white shadow-md" : "bg-white text-stone-600 border border-stone-200"}`}>
          👤<br/>Mon<br/>profil
        </button>
      </div>

      {showPinChanger && currentUser && (
        <PinChanger
          userId={currentUser.id}
          currentPin={pins[currentUser.id] || "1234"}
          onSave={async (newPin) => { await onChangePin(currentUser.id, newPin); setShowPinChanger(false); setPinSuccess(true); setTimeout(() => setPinSuccess(false), 2000); }}
          onCancel={() => setShowPinChanger(false)}
        />
      )}
      {pinSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span className="text-sm font-medium">Code PIN mis à jour !</span>
        </div>
      )}

      {view === "nouvelle" ? (
        <ChefCommandeView
          catalogue={catalogue}
          allRequests={requests}
          onAddRequest={onAddRequest}
          currentEmployee={currentEmployee}
          myRequests={requests.filter((r) => r.par === currentEmployee)}
        />
      ) : view === "profil" ? (
        <div className="p-5 max-w-md mx-auto">
          <ProfilView currentUser={currentUser} pins={pins} onChangePin={onChangePin} />
        </div>
      ) : view === "monnaie" ? (
        <div className="p-5">
          <CashList
            cashRequests={cashRequests}
            employees={employees}
            currentIdentity={currentUser?.name || "Chef d'équipe"}
            onToggleDelivered={onToggleCashDelivered}
            onRemove={onRemoveCashRequest}
          />
        </div>
      ) : view === "home" ? (
        <div className="p-5">
          {cashRequests.filter((c) => !c.livre).length > 0 && (
            <button
              onClick={() => setView("monnaie")}
              className="w-full bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium flex items-center gap-2 text-left"
            >
              💰
              <span>
                {cashRequests.filter((c) => !c.livre).length} demande{cashRequests.filter((c) => !c.livre).length > 1 ? "s" : ""} de monnaie en attente de livraison
              </span>
            </button>
          )}
          {requests.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">
              <Clock className="mx-auto mb-2" size={28} />
              Aucune demande en attente
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-stone-400">{selectedIds.length} sélectionné(s)</span>
                <div className="flex gap-3">
                  <button onClick={selectAll} className="text-xs text-amber-700 underline">
                    Tout sélectionner
                  </button>
                  {selectedIds.length > 0 && (
                    <button onClick={clearSelection} className="text-xs text-stone-400 underline">
                      Désélectionner
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {requests.map((r) => {
                  const item = r.articleId ? catalogue.find((c) => c.id === r.articleId) : null;

                  const isSelected = selectedIds.includes(r.id);
                  const commentOpen = commentOpenId === r.id;
                  return (
                    <div
                      key={r.id}
                      className={`bg-white border rounded-xl px-4 py-3 transition-colors ${
                        isSelected ? "border-amber-400 bg-amber-50" : "border-stone-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleSelect(r.id)}
                            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "bg-amber-600 border-amber-600" : "border-stone-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={13} className="text-white" />}
                          </button>
                          <div>
                            <div className="text-sm flex items-center gap-1 flex-wrap">
                              {r.isNouveau && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                              <span className={r.isNouveau ? "font-bold text-stone-900" : articleNameClass(item)}>
                                {r.isNouveau ? (r.nomLibre || "Article libre") : (item ? item.name : "Article supprimé")}
                              </span>
                            </div>
                            <div className="text-xs text-stone-400">
                              {item?.code ? `${item.code} · ` : ""}
                              {item?.category} {item?.subcategory ? `· ${item.subcategory}` : ""} · {r.par} ·{" "}
                              {new Date(r.date).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={r.quantite}
                            onChange={(e) => onUpdateQty(r.id, Number(e.target.value))}
                            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-center text-sm"
                          />
                          <button
                            onClick={() => setConfirmDelete({ id: r.id, label: item ? item.name : "cet article" })}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pl-8">
                        {r.commentaire ? (
                          <button
                            onClick={() => setCommentOpenId(commentOpen ? null : r.id)}
                            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                          >
                            💬 {r.commentaire}
                          </button>
                        ) : (
                          <button
                            onClick={() => setCommentOpenId(commentOpen ? null : r.id)}
                            className="text-xs text-stone-400 underline"
                          >
                            + Ajouter un commentaire
                          </button>
                        )}

                        {commentOpen && (
                          <CommentEditor
                            value={r.commentaire || ""}
                            onSave={(text) => {
                              onUpdateComment(r.id, text);
                              setCommentOpenId(null);
                            }}
                            onCancel={() => setCommentOpenId(null)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => {
                      onValidate(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="w-full bg-amber-700 text-amber-50 rounded-xl py-3 font-medium hover:bg-amber-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Valider la sélection ({selectedIds.length})
                  </button>
                )}
                <button
                  onClick={() => onValidate()}
                  className="w-full bg-emerald-600 text-white rounded-xl py-3 font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Valider toute la commande
                </button>
              </div>
            </>
          )}
        </div>
      ) : view === "history" ? (
        <div className="p-5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <HistoryByDate
              history={history}
              catalogue={catalogue}
              employees={employees}
              onToggleReceived={onToggleReceived}
              onUpdateComment={onUpdateHistoryComment}
              currentIdentity={currentUser?.name || "Chef d'équipe"}
              mode="attente"
            />
          )}
        </div>
      ) : (
        <div className="p-5">
          {confirmClearHistory && (
            <ConfirmDialog
              title="Effacer tout l'historique ?"
              message="Toutes les commandes validées seront supprimées définitivement."
              onCancel={() => setConfirmClearHistory(false)}
              onConfirm={() => { onClearHistory(); setConfirmClearHistory(false); }}
            />
          )}
          {history.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-sm">Aucune commande passée encore</div>
          ) : (
            <>
              <HistoryByDate
                history={history}
                catalogue={catalogue}
                employees={employees}
                onToggleReceived={onToggleReceived}
                onUpdateComment={onUpdateHistoryComment}
                currentIdentity={currentUser?.name || "Chef d'équipe"}
                mode="livre"
                onClearDay={(dayLabel) => onClearHistory(dayLabel)}
              />
              <button
                onClick={() => setConfirmClearHistory(true)}
                className="w-full mt-4 border border-red-200 text-red-500 rounded-xl py-3 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={15} /> Effacer tout l'historique reçu
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


function PartialDeliveryModal({ article, onFull, onPartial, onCancel }) {
  const name = article.isNouveau ? (article.nomLibre || "Article libre") : (article.item?.name || "Article");
  const [qty, setQty] = useState(article.quantite);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="font-semibold text-stone-800 mb-1">Réception — {name}</h3>
          <p className="text-sm text-stone-500">Quantité commandée : <span className="font-bold text-stone-700">{article.quantite}</span></p>
        </div>

        <div className="bg-stone-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-stone-500 mb-2 text-center">Quantité réellement reçue</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setQty(q => Math.max(0, q - 1))} className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-lg flex items-center justify-center">−</button>
            <input
              type="number"
              min="0"
              max={article.quantite}
              value={qty}
              onChange={(e) => setQty(Math.min(article.quantite, Math.max(0, Number(e.target.value))))}
              className="w-20 text-center border border-stone-200 rounded-xl py-2 text-lg font-bold"
            />
            <button onClick={() => setQty(q => Math.min(article.quantite, q + 1))} className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-lg flex items-center justify-center">+</button>
          </div>
          {qty < article.quantite && (
            <p className="text-center text-xs text-red-500 mt-2 font-medium">⚠️ Manque : {article.quantite - qty} unité{article.quantite - qty > 1 ? "s" : ""}</p>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onFull()}
            className="w-full bg-emerald-600 text-white rounded-xl py-3 font-medium hover:bg-emerald-700 transition-colors"
          >
            ✅ Tout reçu ({article.quantite})
          </button>
          <button
            onClick={() => onPartial(qty)}
            disabled={qty === article.quantite || qty === 0}
            className="w-full bg-amber-600 text-white rounded-xl py-3 font-medium hover:bg-amber-700 transition-colors disabled:opacity-40"
          >
            ⚠️ Livraison partielle ({qty} reçus)
          </button>
          <button onClick={onCancel} className="w-full text-stone-400 text-sm py-2">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function HistoryByDate({ history, catalogue, employees, onToggleReceived, onUpdateComment, currentIdentity, mode, onClearDay }) {
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD", only used for mode "livre"
  const [commentOpenId, setCommentOpenId] = useState(null);

  const [justChecked, setJustChecked] = useState(null);
  const [partialModal, setPartialModal] = useState(null); // { article, orderId }

  function handleCheckClick(a) {
    if (a.recu) {
      onToggleReceived(a.orderId, a.id, currentIdentity || "Inconnu");
      return;
    }
    // Ask if full or partial delivery
    setPartialModal({ a, orderId: a.orderId });
  }

  function confirmReceived(a, quantiteRecue) {
    setPartialModal(null);
    setJustChecked(a.id);
    setTimeout(() => {
      onToggleReceived(a.orderId, a.id, currentIdentity || "Inconnu", quantiteRecue);
      setJustChecked(null);
    }, 600);
  }

  // Flatten + filter all articles across all orders according to mode
  const flatArticles = [];
  for (const order of history) {
    for (const a of order.articles) {
      const item = catalogue.find((c) => c.id === a.articleId);
      flatArticles.push({ ...a, orderId: order.id, item, orderDate: order.date });
    }
  }
  let filtered = mode === "livre" ? flatArticles.filter((a) => a.recu) : flatArticles.filter((a) => !a.recu);

  if (mode === "livre" && selectedDate) {
    filtered = filtered.filter((a) => {
      const d = new Date(a.orderDate);
      const localKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return localKey === selectedDate;
    });
  }

  // Group filtered articles by calendar day (based on order date)
  const byDay = {};
  for (const a of filtered) {
    const d = new Date(a.orderDate);
    const dayKey = d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
    if (!byDay[dayKey]) byDay[dayKey] = { date: d, articles: [] };
    byDay[dayKey].articles.push(a);
  }
  const sortedDays = Object.entries(byDay).sort((a, b) => b[1].date - a[1].date);

  return (
    <div className="space-y-5">
      {partialModal && (
        <PartialDeliveryModal
          article={partialModal.a}
          onFull={() => confirmReceived(partialModal.a, partialModal.a.quantite)}
          onPartial={(qty) => confirmReceived(partialModal.a, qty)}
          onCancel={() => setPartialModal(null)}
        />
      )}
      {mode === "livre" && (
        <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3">
          <Clock className="text-stone-400 shrink-0" size={16} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="text-xs text-amber-700 underline shrink-0">
              Tout voir
            </button>
          )}
        </div>
      )}

      {mode === "attente" && filtered.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={16} />
            <span className="text-sm font-semibold text-amber-700">
              {filtered.length} article{filtered.length > 1 ? "s" : ""} en attente de livraison
              {filtered.filter(a => a.isReste).length > 0 && (
                <span className="ml-2 text-orange-600">· {filtered.filter(a => a.isReste).length} reste{filtered.filter(a => a.isReste).length > 1 ? "s" : ""} à livrer</span>
              )}
            </span>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          {mode === "livre"
            ? selectedDate
              ? "Aucun article livré ce jour-là"
              : "Aucun article livré pour le moment"
            : "Tout a été livré 🎉"}
        </div>
      ) : (
        sortedDays.map(([dayLabel, { articles }]) => {
          const byCategory = {};
          for (const a of articles) {
            const cat = a.item?.category || "Sans catégorie";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(a);
          }
          function printDay(dayLabel, byCategory) {
            // Build print content
            const articleRows = Object.entries(byCategory).map(([cat, items]) =>
              `<div style="margin-bottom:12px"><div style="font-weight:bold;color:#78350f;font-size:12px;text-transform:uppercase;border-bottom:1px solid #e7e5e4;padding-bottom:4px;margin-bottom:6px">${cat}</div>` +
              items.map(a => {
                const name = a.isNouveau ? (a.nomLibre || 'Article libre') : (a.item?.name || 'Article');
                const code = a.item?.code ? `${a.item.code} · ` : '';
                const status = a.recu ? '✅' : '⏳';
                return `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
                  <span>${status} ${code}${name}${a.isNouveau ? ' 🆕' : ''} <span style="color:#888;font-size:11px">(${a.par})</span></span>
                  <span style="font-weight:bold">x${a.quantite}</span>
                </div>`;
              }).join('') + '</div>'
            ).join('');
            
            const printContent = `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
                <div style="text-align:center;margin-bottom:16px">
                  <div style="background:#78350f;color:#fef3c7;border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:20px;margin:0 auto 8px">CG</div>
                  <div style="font-size:18px;font-weight:bold;color:#78350f">Brasserie Chez Gustave</div>
                  <div style="font-size:13px;color:#888;margin-top:4px">Commande du ${dayLabel}</div>
                </div>
                ${articleRows}
                <div style="margin-top:16px;font-size:10px;color:#aaa;text-align:center">Chez Gustave Stock — ${new Date().toLocaleDateString('fr-FR')}</div>
              </div>`;
            
            // Create iframe for printing (works on mobile)
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
            iframe.contentDocument.open();
            iframe.contentDocument.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@media print{body{margin:0}}</style></head><body>${printContent}</body></html>`);
            iframe.contentDocument.close();
            setTimeout(() => {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              setTimeout(() => document.body.removeChild(iframe), 1000);
            }, 500);
          }

          return (
            <div key={dayLabel}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-amber-700 uppercase tracking-wide capitalize">
                  {dayLabel}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printDay(dayLabel, byCategory, articles)}
                    className="text-xs text-stone-400 hover:text-amber-700 flex items-center gap-1 border border-stone-200 rounded-lg px-2 py-1 hover:border-amber-300 transition-colors"
                  >
                    🖨️ Imprimer
                  </button>
                  {mode === "livre" && onClearDay && (
                    <button
                      onClick={() => onClearDay(dayLabel)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-100 rounded-lg px-2 py-1 hover:border-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="text-xs font-semibold text-stone-500 mb-1">{cat}</div>
                    <div className="space-y-2">
                      {items.map((a) => (
                        <div key={a.id} className={`flex items-start gap-2 text-sm py-0.5 rounded-lg px-1 ${a.isReste && mode === "attente" ? "bg-orange-50 border border-orange-200" : ""}`}>
                          {a.isReste && mode === "attente" && (
                            <div className="w-full mb-1 text-[11px] text-orange-600 font-medium flex items-center gap-1">
                              🔄 Reste à livrer — commande du {a.resteDepuis}
                            </div>
                          )}
                          <button
                            onClick={() => handleCheckClick(a)}
                            className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              a.recu || justChecked === a.id ? "bg-emerald-600 border-emerald-600" : a.isReste ? "border-orange-400 bg-orange-50" : "border-stone-300 bg-white"
                            }`}
                          >
                            {(a.recu || justChecked === a.id) && <Check size={13} className="text-white" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 flex-wrap flex-1">
                                {a.isNouveau && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                                {a.livraisonPartielle && <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">⚠️ {a.manquant} manquant{a.manquant > 1 ? 's' : ''}</span>}
                                <span className="text-stone-400 font-normal text-xs">{a.item?.code ? `${a.item.code} · ` : ""}</span>
                                <span className={a.isNouveau ? "font-bold text-stone-900" : articleNameClass(a.item)}>
                                  {a.isNouveau ? (a.nomLibre || "Article libre") : (a.item ? a.item.name : "Article supprimé")}
                                </span>
                              </span>
                              <span className="text-stone-400 text-xs">x{a.quantite}</span>
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              Commandé par <span className="font-medium text-stone-500">{a.par}</span>
                              {a.isReste && mode === "livre" && (
                                <span className="text-stone-400"> · Reçu en 2 fois</span>
                              )}
                              {a.recuPar && (
                                <>
                                  {" "}
                                  · Reçu par <span className="font-medium text-emerald-600">{a.recuPar}</span>
                                  {a.recuDate && (
                                    <> le {new Date(a.recuDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>
                                  )}
                                </>
                              )}
                              {a.corrigePar && (
                                <>
                                  {" "}
                                  · <span className="font-medium text-orange-600">
                                    {a.recu ? "Re-confirmé" : "Corrigé (non livré)"} par {a.corrigePar}
                                  </span>
                                  {a.corrigeDate && (
                                    <> le {new Date(a.corrigeDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="mt-1">
                              {a.commentaire ? (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-flex items-center gap-1">
                                  💬 {a.commentaire}
                                </div>
                              ) : mode === "livre" ? (
                                <button
                                  onClick={() => setCommentOpenId(commentOpenId === a.id ? null : a.id)}
                                  className="text-xs text-stone-400 underline"
                                >
                                  + Ajouter un commentaire
                                </button>
                              ) : null}

                              {commentOpenId === a.id && mode === "livre" && (
                                <CommentEditor
                                  value={a.commentaire || ""}
                                  onSave={(text) => {
                                    onUpdateComment && onUpdateComment(a.orderId, a.id, text);
                                    setCommentOpenId(null);
                                  }}
                                  onCancel={() => setCommentOpenId(null)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CatalogueManager({ catalogue, onAdd, onUpdate, onRemove, onRenameCategory, onRenameSubcategory }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [minStock, setMinStock] = useState("");
  const [minUnit, setMinUnit] = useState("pièce");
  const [groupe, setGroupe] = useState("Alimentaire");
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, label }
  const [editingItem, setEditingItem] = useState(null); // { id, code, name }
  const [editingCat, setEditingCat] = useState(null); // { oldName, newName }
  const [editingSub, setEditingSub] = useState(null); // { category, oldSub, newSub }
  // Empty category creation
  const [showNewCatBox, setShowNewCatBox] = useState(false);
  const [emptyCatGroupe, setEmptyCatGroupe] = useState("Alimentaire");
  const [emptyCatName, setEmptyCatName] = useState("");
  const [emptyCatSub, setEmptyCatSub] = useState("");
  const tree = groupCatalogue(catalogue);

  function createEmptyCategory() {
    if (!emptyCatName.trim()) return;
    // Create category via a placeholder item (hidden from ordering views)
    onAdd({
      code: "",
      name: "__placeholder__",
      groupe: emptyCatGroupe,
      category: emptyCatName.trim(),
      subcategory: emptyCatSub.trim() || "Général",
      minStock: 0,
      minUnit: "pièce",
      _placeholder: true,
    });
    setEmptyCatName("");
    setEmptyCatSub("");
    setShowNewCatBox(false);
  }

  const existingCategories = Object.keys(tree).sort();
  const finalCategory = category === "__new__" ? newCategory.trim() : category;
  const subcategoriesForCategory = category && category !== "__new__" ? Object.keys(tree[category] || {}).sort() : [];
  const finalSubcategory = subcategory === "__new__" ? newSubcategory.trim() : subcategory;

  function submit() {
    if (!name.trim() || !finalCategory) return;
    onAdd({
      code: code.trim(),
      name: name.trim(),
      groupe: groupe,
      category: finalCategory,
      subcategory: finalSubcategory || "Général",
      minStock: minStock ? Number(minStock) : 0,
      minUnit: minUnit,
    });
    setCode("");
    setName("");
    setMinStock("");
    if (category === "__new__") {
      setCategory(finalCategory);
      setNewCategory("");
    }
    if (subcategory === "__new__") {
      setSubcategory(finalSubcategory);
      setNewSubcategory("");
    }
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      {confirmDelete && (
        <ConfirmDialog
          title="Supprimer cet article ?"
          message={`"${confirmDelete.label}" sera retiré définitivement du catalogue.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onRemove(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Ajouter un article</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code article (ex: BOI-004)"
              className="w-36 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'article"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={groupe}
              onChange={(e) => setGroupe(e.target.value)}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Alimentaire">🧃 Alimentaire</option>
              <option value="Non Alimentaire">🥡 Non Alimentaire</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
                setNewSubcategory("");
              }}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Catégorie…</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">+ Créer une nouvelle catégorie</option>
            </select>
          </div>
          {category === "__new__" && (
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">Sous-catégorie…</option>
              {subcategoriesForCategory.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__new__">+ Créer une nouvelle sous-catégorie</option>
            </select>
          </div>
          {subcategory === "__new__" && (
            <input
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="Nom de la nouvelle sous-catégorie"
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="Stock min"
              className="w-24 border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={minUnit}
              onChange={(e) => setMinUnit(e.target.value)}
              className="flex-1 border border-stone-200 rounded-lg px-2 py-2 text-sm bg-white"
            >
              <option value="pièce">Pièce</option>
              <option value="btl">Btl</option>
              <option value="kg">Kg</option>
              <option value="litre">Litre</option>
              <option value="carton">Carton</option>
            </select>
            <button onClick={submit} className="bg-stone-800 text-white px-4 rounded-lg text-sm flex items-center gap-1">
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6">
        {!showNewCatBox ? (
          <button
            onClick={() => setShowNewCatBox(true)}
            className="w-full text-sm font-medium text-amber-700 border-2 border-dashed border-amber-300 rounded-lg py-3 hover:bg-amber-50 transition-colors"
          >
            📁 Créer une catégorie vide
          </button>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-stone-700">Nouvelle catégorie vide</h3>
            <p className="text-xs text-stone-400">Créez la catégorie puis déplacez-y des articles existants.</p>
            <select
              value={emptyCatGroupe}
              onChange={(e) => setEmptyCatGroupe(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Alimentaire">🧃 Alimentaire</option>
              <option value="Non Alimentaire">🥡 Non Alimentaire</option>
            </select>
            <input
              value={emptyCatName}
              onChange={(e) => setEmptyCatName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
            <input
              value={emptyCatSub}
              onChange={(e) => setEmptyCatSub(e.target.value)}
              placeholder="Sous-catégorie (optionnel)"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={createEmptyCategory} className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium">✓ Enregistrer</button>
              <button onClick={() => { setShowNewCatBox(false); setEmptyCatName(""); setEmptyCatSub(""); }} className="text-stone-400 text-sm px-2">Annuler</button>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-xs uppercase tracking-wide text-stone-400 mb-2">Catalogue actuel</h3>
      <p className="text-xs text-stone-400 mb-3">✏️ Touchez un nom pour le modifier</p>
      <div className="space-y-4">
        {Object.entries(tree).map(([cat, subs]) => (
          <div key={cat}>
            {editingCat?.oldName === cat ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  value={editingCat.newName}
                  onChange={(e) => setEditingCat({ ...editingCat, newName: e.target.value })}
                  className="flex-1 border border-amber-300 rounded-lg px-2 py-1 text-sm font-medium"
                  autoFocus
                />
                <button onClick={() => { onRenameCategory(cat, editingCat.newName); setEditingCat(null); }} className="text-emerald-600 text-sm font-medium">✓</button>
                <button onClick={() => setEditingCat(null)} className="text-stone-400 text-sm">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingCat({ oldName: cat, newName: cat })}
                className="text-sm font-medium text-stone-800 mb-1 flex items-center gap-1 hover:text-amber-700"
              >
                {cat} <span className="text-stone-300 text-xs">✏️</span>
              </button>
            )}
            {Object.entries(subs).map(([sub, items]) => (
              <div key={sub} className="mb-2">
                {editingSub?.category === cat && editingSub?.oldSub === sub ? (
                  <div className="flex items-center gap-2 mb-1 pl-2">
                    <input
                      value={editingSub.newSub}
                      onChange={(e) => setEditingSub({ ...editingSub, newSub: e.target.value })}
                      className="flex-1 border border-amber-300 rounded-lg px-2 py-1 text-xs"
                      autoFocus
                    />
                    <button onClick={() => { onRenameSubcategory(cat, sub, editingSub.newSub); setEditingSub(null); }} className="text-emerald-600 text-xs">✓</button>
                    <button onClick={() => setEditingSub(null)} className="text-stone-400 text-xs">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSub({ category: cat, oldSub: sub, newSub: sub })}
                    className="text-xs text-stone-400 mb-1 pl-2 flex items-center gap-1 hover:text-amber-600"
                  >
                    {sub} <span className="text-stone-300">✏️</span>
                  </button>
                )}
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {editingItem?.id === item.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              value={editingItem.code}
                              onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                              placeholder="Code"
                              className="w-28 border border-amber-300 rounded px-2 py-1 text-xs"
                            />
                            <input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              placeholder="Nom"
                              className="flex-1 border border-amber-300 rounded px-2 py-1 text-sm"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 uppercase">Groupe</label>
                            <select
                              value={editingItem.groupe}
                              onChange={(e) => setEditingItem({ ...editingItem, groupe: e.target.value })}
                              className="w-full border border-amber-300 rounded px-2 py-1 text-xs bg-white"
                            >
                              <option value="Alimentaire">🧃 Alimentaire</option>
                              <option value="Non Alimentaire">🥡 Non Alimentaire</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 uppercase">Catégorie</label>
                            <select
                              value={editingItem.catMode === "new" ? "__new__" : editingItem.category}
                              onChange={(e) => {
                                if (e.target.value === "__new__") setEditingItem({ ...editingItem, catMode: "new", category: "" });
                                else setEditingItem({ ...editingItem, catMode: "existing", category: e.target.value });
                              }}
                              className="w-full border border-amber-300 rounded px-2 py-1 text-xs bg-white"
                            >
                              {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                              <option value="__new__">+ Nouvelle catégorie</option>
                            </select>
                            {editingItem.catMode === "new" && (
                              <input
                                value={editingItem.category}
                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                placeholder="Nom nouvelle catégorie"
                                className="w-full border border-amber-300 rounded px-2 py-1 text-xs mt-1"
                              />
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-400 uppercase">Sous-catégorie</label>
                            <input
                              value={editingItem.subcategory}
                              onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                              placeholder="Sous-catégorie"
                              className="w-full border border-amber-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                onUpdate(item.id, {
                                  code: editingItem.code.trim(),
                                  name: editingItem.name.trim(),
                                  groupe: editingItem.groupe,
                                  category: editingItem.category.trim() || item.category,
                                  subcategory: editingItem.subcategory.trim() || "Général",
                                });
                                setEditingItem(null);
                              }}
                              className="bg-emerald-600 text-white rounded-lg px-3 py-1 text-xs font-medium"
                            >
                              ✓ Enregistrer
                            </button>
                            <button onClick={() => setEditingItem(null)} className="text-stone-400 text-xs px-2">Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setEditingItem({ id: item.id, code: item.code || "", name: item.name, groupe: item.groupe || "Alimentaire", category: item.category, subcategory: item.subcategory || "Général", catMode: "existing" })}
                            className="text-stone-700 text-left flex-1 flex items-center gap-1 hover:text-amber-700"
                          >
                            <span>{item.code ? `${item.code} · ` : ""}{item.name}</span>
                            <span className="text-stone-300 text-xs">✏️</span>
                          </button>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-stone-400">
                              Min
                              <input
                                type="number"
                                min="0"
                                value={item.minStock}
                                onChange={(e) => onUpdate(item.id, { minStock: Number(e.target.value) })}
                                className="w-12 border border-stone-200 rounded px-1 py-0.5 text-center"
                              />
                              <select
                                value={item.minUnit || "pièce"}
                                onChange={(e) => onUpdate(item.id, { minUnit: e.target.value })}
                                className="border border-stone-200 rounded px-1 py-0.5 text-xs bg-white"
                              >
                                <option value="pièce">Pièce</option>
                                <option value="btl">Btl</option>
                                <option value="kg">Kg</option>
                                <option value="litre">Litre</option>
                                <option value="carton">Carton</option>
                              </select>
                            </div>
                            <button
                              onClick={() => setConfirmDelete({ id: item.id, label: item.name })}
                              className="text-stone-300 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
