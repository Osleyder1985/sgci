CREATE TABLE "CatalogoProvinciaCubana" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "nombreNormalizado" TEXT NOT NULL UNIQUE,
  "esMunicipioEspecial" BOOLEAN NOT NULL DEFAULT FALSE,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CatalogoMunicipioCubano" (
  "id" SERIAL PRIMARY KEY,
  "provinciaId" INTEGER NOT NULL REFERENCES "CatalogoProvinciaCubana"("id") ON DELETE RESTRICT,
  "nombre" TEXT NOT NULL,
  "nombreNormalizado" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogoMunicipioCubano_provinciaId_nombre_key" UNIQUE ("provinciaId","nombreNormalizado")
);

CREATE TABLE "CatalogoLocalidadCubana" (
  "id" SERIAL PRIMARY KEY,
  "municipioId" INTEGER NOT NULL REFERENCES "CatalogoMunicipioCubano"("id") ON DELETE RESTRICT,
  "nombre" TEXT NOT NULL,
  "nombreNormalizado" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogoLocalidadCubana_municipioId_nombre_key" UNIQUE ("municipioId","nombreNormalizado")
);

CREATE TABLE "CatalogoConsejoPopularCubano" (
  "id" SERIAL PRIMARY KEY,
  "municipioId" INTEGER NOT NULL REFERENCES "CatalogoMunicipioCubano"("id") ON DELETE RESTRICT,
  "nombre" TEXT NOT NULL,
  "nombreNormalizado" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CatalogoConsejoPopularCubano_municipioId_nombre_key" UNIQUE ("municipioId","nombreNormalizado")
);

CREATE TABLE "CatalogoAliasTerritorialCubano" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "valorNormalizado" TEXT NOT NULL UNIQUE,
  "valorCanonico" TEXT NOT NULL,
  "provinciaId" INTEGER REFERENCES "CatalogoProvinciaCubana"("id") ON DELETE CASCADE,
  "municipioId" INTEGER REFERENCES "CatalogoMunicipioCubano"("id") ON DELETE CASCADE,
  "localidadId" INTEGER REFERENCES "CatalogoLocalidadCubana"("id") ON DELETE CASCADE,
  "consejoPopularId" INTEGER REFERENCES "CatalogoConsejoPopularCubano"("id") ON DELETE CASCADE,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX "CatalogoMunicipioCubano_nombreNormalizado_idx" ON "CatalogoMunicipioCubano"("nombreNormalizado");
CREATE INDEX "CatalogoLocalidadCubana_nombreNormalizado_idx" ON "CatalogoLocalidadCubana"("nombreNormalizado");
CREATE INDEX "CatalogoConsejoPopularCubano_nombreNormalizado_idx" ON "CatalogoConsejoPopularCubano"("nombreNormalizado");
CREATE INDEX "CatalogoAliasTerritorialCubano_valorNormalizado_idx" ON "CatalogoAliasTerritorialCubano"("valorNormalizado");

INSERT INTO "CatalogoProvinciaCubana" ("id","nombre","nombreNormalizado","esMunicipioEspecial") VALUES
(1,'Pinar del Río','PINAR DEL RIO',false),(2,'Artemisa','ARTEMISA',false),(3,'La Habana','LA HABANA',false),(4,'Mayabeque','MAYABEQUE',false),(5,'Matanzas','MATANZAS',false),(6,'Cienfuegos','CIENFUEGOS',false),(7,'Villa Clara','VILLA CLARA',false),(8,'Sancti Spíritus','SANCTI SPIRITUS',false),(9,'Ciego de Ávila','CIEGO DE AVILA',false),(10,'Camagüey','CAMAGUEY',false),(11,'Las Tunas','LAS TUNAS',false),(12,'Holguín','HOLGUIN',false),(13,'Granma','GRANMA',false),(14,'Santiago de Cuba','SANTIAGO DE CUBA',false),(15,'Guantánamo','GUANTANAMO',false),(16,'Isla de la Juventud','ISLA DE LA JUVENTUD',true);

INSERT INTO "CatalogoMunicipioCubano" ("id","provinciaId","nombre","nombreNormalizado") VALUES
(1,1,'Consolación del Sur','CONSOLACION DEL SUR'),(2,1,'Guane','GUANE'),(3,1,'La Palma','LA PALMA'),(4,1,'Los Palacios','LOS PALACIOS'),(5,1,'Mantua','MANTUA'),(6,1,'Minas de Matahambre','MINAS DE MATAHAMBRE'),(7,1,'Pinar del Río','PINAR DEL RIO'),(8,1,'San Juan y Martínez','SAN JUAN Y MARTINEZ'),(9,1,'San Luis','SAN LUIS'),(10,1,'Sandino','SANDINO'),(11,1,'Viñales','VINALES'),
(12,2,'Alquízar','ALQUIZAR'),(13,2,'Artemisa','ARTEMISA'),(14,2,'Bahía Honda','BAHIA HONDA'),(15,2,'Bauta','BAUTA'),(16,2,'Caimito','CAIMITO'),(17,2,'Candelaria','CANDELARIA'),(18,2,'Guanajay','GUANAJAY'),(19,2,'Güira de Melena','GUIRA DE MELENA'),(20,2,'Mariel','MARIEL'),(21,2,'San Antonio de los Baños','SAN ANTONIO DE LOS BANOS'),(22,2,'San Cristóbal','SAN CRISTOBAL'),
(23,3,'Arroyo Naranjo','ARROYO NARANJO'),(24,3,'Boyeros','BOYEROS'),(25,3,'Centro Habana','CENTRO HABANA'),(26,3,'Cerro','CERRO'),(27,3,'Cotorro','COTORRO'),(28,3,'Diez de Octubre','DIEZ DE OCTUBRE'),(29,3,'Guanabacoa','GUANABACOA'),(30,3,'La Habana del Este','LA HABANA DEL ESTE'),(31,3,'La Habana Vieja','LA HABANA VIEJA'),(32,3,'La Lisa','LA LISA'),(33,3,'Marianao','MARIANAO'),(34,3,'Playa','PLAYA'),(35,3,'Plaza de la Revolución','PLAZA DE LA REVOLUCION'),(36,3,'Regla','REGLA'),(37,3,'San Miguel del Padrón','SAN MIGUEL DEL PADRON'),
(38,4,'Batabanó','BATABANO'),(39,4,'Bejucal','BEJUCAL'),(40,4,'Güines','GUINES'),(41,4,'Jaruco','JARUCO'),(42,4,'Madruga','MADRUGA'),(43,4,'Melena del Sur','MELENA DEL SUR'),(44,4,'Nueva Paz','NUEVA PAZ'),(45,4,'Quivicán','QUIVICAN'),(46,4,'San José de las Lajas','SAN JOSE DE LAS LAJAS'),(47,4,'San Nicolás','SAN NICOLAS'),(48,4,'Santa Cruz del Norte','SANTA CRUZ DEL NORTE'),
(49,5,'Calimete','CALIMETE'),(50,5,'Cárdenas','CARDENAS'),(51,5,'Ciénaga de Zapata','CIENAGA DE ZAPATA'),(52,5,'Colón','COLON'),(53,5,'Jagüey Grande','JAGUEY GRANDE'),(54,5,'Jovellanos','JOVELLANOS'),(55,5,'Limonar','LIMONAR'),(56,5,'Los Arabos','LOS ARABOS'),(57,5,'Martí','MARTI'),(58,5,'Matanzas','MATANZAS'),(59,5,'Pedro Betancourt','PEDRO BETANCOURT'),(60,5,'Perico','PERICO'),(61,5,'Unión de Reyes','UNION DE REYES'),
(62,6,'Abreus','ABREUS'),(63,6,'Aguada de Pasajeros','AGUADA DE PASAJEROS'),(64,6,'Cienfuegos','CIENFUEGOS'),(65,6,'Cruces','CRUCES'),(66,6,'Cumanayagua','CUMANAYAGUA'),(67,6,'Lajas','LAJAS'),(68,6,'Palmira','PALMIRA'),(69,6,'Rodas','RODAS'),
(70,7,'Caibarién','CAIBARIEN'),(71,7,'Camajuaní','CAMAJUANI'),(72,7,'Cifuentes','CIFUENTES'),(73,7,'Corralillo','CORRALILLO'),(74,7,'Encrucijada','ENCRUCIJADA'),(75,7,'Manicaragua','MANICARAGUA'),(76,7,'Placetas','PLACETAS'),(77,7,'Quemado de Güines','QUEMADO DE GUINES'),(78,7,'Ranchuelo','RANCHUELO'),(79,7,'San Juan de los Remedios','SAN JUAN DE LOS REMEDIOS'),(80,7,'Sagua la Grande','SAGUA LA GRANDE'),(81,7,'Santa Clara','SANTA CLARA'),(82,7,'Santo Domingo','SANTO DOMINGO'),
(83,8,'Cabaiguán','CABAIGUAN'),(84,8,'Fomento','FOMENTO'),(85,8,'Jatibonico','JATIBONICO'),(86,8,'La Sierpe','LA SIERPE'),(87,8,'Sancti Spíritus','SANCTI SPIRITUS'),(88,8,'Taguasco','TAGUASCO'),(89,8,'Trinidad','TRINIDAD'),(90,8,'Yaguajay','YAGUAJAY'),
(91,9,'Baraguá','BARAGUA'),(92,9,'Bolivia','BOLIVIA'),(93,9,'Chambas','CHAMBAS'),(94,9,'Ciego de Ávila','CIEGO DE AVILA'),(95,9,'Ciro Redondo','CIRO REDONDO'),(96,9,'Florencia','FLORENCIA'),(97,9,'Majagua','MAJAGUA'),(98,9,'Morón','MORON'),(99,9,'Primero de Enero','PRIMERO DE ENERO'),(100,9,'Venezuela','VENEZUELA'),
(101,10,'Camagüey','CAMAGUEY'),(102,10,'Carlos Manuel de Céspedes','CARLOS MANUEL DE CESPEDES'),(103,10,'Esmeralda','ESMERALDA'),(104,10,'Florida','FLORIDA'),(105,10,'Guáimaro','GUAIMARO'),(106,10,'Jimaguayú','JIMAGUAYU'),(107,10,'Minas','MINAS'),(108,10,'Najasa','NAJASA'),(109,10,'Nuevitas','NUEVITAS'),(110,10,'Santa Cruz del Sur','SANTA CRUZ DEL SUR'),(111,10,'Sibanicú','SIBANICU'),(112,10,'Sierra de Cubitas','SIERRA DE CUBITAS'),(113,10,'Vertientes','VERTIENTES'),
(114,11,'Amancio','AMANCIO'),(115,11,'Colombia','COLOMBIA'),(116,11,'Jesús Menéndez','JESUS MENENDEZ'),(117,11,'Jobabo','JOBABO'),(118,11,'Las Tunas','LAS TUNAS'),(119,11,'Majibacoa','MAJIBACOA'),(120,11,'Manatí','MANATI'),(121,11,'Puerto Padre','PUERTO PADRE'),
(122,12,'Antilla','ANTILLA'),(123,12,'Báguanos','BAGUANOS'),(124,12,'Banes','BANES'),(125,12,'Cacocum','CACOCUM'),(126,12,'Calixto García','CALIXTO GARCIA'),(127,12,'Cueto','CUETO'),(128,12,'Frank País','FRANK PAIS'),(129,12,'Gibara','GIBARA'),(130,12,'Holguín','HOLGUIN'),(131,12,'Mayarí','MAYARI'),(132,12,'Moa','MOA'),(133,12,'Rafael Freyre','RAFAEL FREYRE'),(134,12,'Sagua de Tánamo','SAGUA DE TANAMO'),(135,12,'Urbano Noris','URBANO NORIS'),
(136,13,'Bartolomé Masó','BARTOLOME MASO'),(137,13,'Bayamo','BAYAMO'),(138,13,'Buey Arriba','BUEY ARRIBA'),(139,13,'Campechuela','CAMPECHELA'),(140,13,'Cauto Cristo','CAUTO CRISTO'),(141,13,'Guisa','GUISA'),(142,13,'Jiguaní','JIGUANI'),(143,13,'Manzanillo','MANZANILLO'),(144,13,'Media Luna','MEDIA LUNA'),(145,13,'Niquero','NIQUERO'),(146,13,'Pilón','PILON'),(147,13,'Río Cauto','RIO CAUTO'),(148,13,'Yara','YARA'),
(149,14,'Contramaestre','CONTRAMAESTRE'),(150,14,'Guamá','GUAMA'),(151,14,'Mella','MELLA'),(152,14,'Palma Soriano','PALMA SORIANO'),(153,14,'San Luis','SAN LUIS'),(154,14,'Santiago de Cuba','SANTIAGO DE CUBA'),(155,14,'Segundo Frente','SEGUNDO FRENTE'),(156,14,'Songo-La Maya','SONGO LA MAYA'),(157,14,'Tercer Frente','TERCER FRENTE'),
(158,15,'Baracoa','BARACOA'),(159,15,'Caimanera','CAIMANERA'),(160,15,'El Salvador','EL SALVADOR'),(161,15,'Guantánamo','GUANTANAMO'),(162,15,'Imías','IMIAS'),(163,15,'Maisí','MAISI'),(164,15,'Manuel Tames','MANUEL TAMES'),(165,15,'Niceto Pérez','NICETO PEREZ'),(166,15,'San Antonio del Sur','SAN ANTONIO DEL SUR'),(167,15,'Yateras','YATERAS'),
(168,16,'Isla de la Juventud','ISLA DE LA JUVENTUD');

INSERT INTO "CatalogoAliasTerritorialCubano" ("tipo","valorNormalizado","valorCanonico","provinciaId") VALUES
('PROVINCIA','HABANA','LA HABANA',3),('PROVINCIA','CIUDAD DE LA HABANA','LA HABANA',3),('PROVINCIA','CIUDAD HABANA','LA HABANA',3),('PROVINCIA','SANTIAGO','SANTIAGO DE CUBA',14),('PROVINCIA','ISLA DE PINOS','ISLA DE LA JUVENTUD',16);

INSERT INTO "CatalogoAliasTerritorialCubano" ("tipo","valorNormalizado","valorCanonico","municipioId") VALUES
('MUNICIPIO','HABANA DEL ESTE','LA HABANA DEL ESTE',30),('MUNICIPIO','PLAZA','PLAZA DE LA REVOLUCION',35),('MUNICIPIO','SAN MIGUEL DEL PADRON','SAN MIGUEL DEL PADRON',37),('MUNICIPIO','DIEZ DE OCTUBRE','DIEZ DE OCTUBRE',28);
