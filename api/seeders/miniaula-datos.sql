CREATE DATABASE  IF NOT EXISTS `miniaula` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `miniaula`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: miniaula
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('borrador','publicado','archivado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador',
  `instructorId` int NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `instructorId` (`instructorId`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`instructorId`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (1,'Sumas y restas divertidas','Curso de matemáticas para aprender sumas y restas paso a paso.','Matemáticas','3ro de primaria','publicado',2,'2026-11-18 01:34:48'),(2,'Matemáticas: sumas y restas','Aprende a sumar, restar y resolver problemas cotidianos con ejemplos y actividades para primaria.','Matemáticas','2do de primaria','publicado',2,'2026-11-17 23:08:43'),(3,'Multiplicar y dividir jugando','Descubre la multiplicación y la división mediante grupos, repartos, tablas y problemas sencillos.','Matemáticas','3ro de primaria','publicado',2,'2026-11-17 23:08:43'),(4,'Exploradores del sistema solar','Conoce el Sol, los ocho planetas, la Tierra, la Luna y los movimientos que observamos en el cielo.','Ciencias Naturales','4to de primaria','publicado',2,'2026-11-17 23:08:43'),(5,'El viaje de una gota de agua','Explora los estados del agua, su ciclo natural y formas de cuidar este recurso vital.','Ciencias Naturales','3ro de primaria','publicado',2,'2026-11-17 23:08:43'),(6,'Figuras geométricas a mi alrededor','Reconoce figuras planas, compara sus lados y vértices, y descubre la geometría en objetos cotidianos.','Matemáticas','2do de primaria','borrador',2,'2026-11-17 23:08:43'),(7,'El mundo de los animales','Clasifica animales vertebrados e invertebrados y conoce sus características y hábitats.','Ciencias Naturales','4to de primaria','archivado',2,'2026-11-17 23:08:43'),(8,'Mi cuerpo y sus sistemas','Aprende cómo funcionan la respiración, la digestión, la circulación y el movimiento del cuerpo.','Ciencias Naturales','5to de primaria','publicado',3,'2026-11-17 23:08:43'),(9,'Pequeños guardianes del planeta','Aprende a reducir, reutilizar y reciclar para proteger el ambiente desde la escuela y el hogar.','Medio Ambiente','5to de primaria','publicado',3,'2026-11-17 23:08:43'),(10,'Aprendo a reconocer mis emociones','Identifica emociones básicas, practica la empatía y descubre maneras respetuosas de expresar lo que sientes.','Educación en Valores','3ro de primaria','borrador',3,'2026-11-17 23:08:43'),(11,'Hábitos saludables para crecer','Descubre hábitos de higiene, alimentación variada, actividad física y descanso para cuidar tu bienestar.','Salud y Bienestar','4to de primaria','archivado',3,'2026-11-17 23:08:43');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecciones`
--

DROP TABLE IF EXISTS `lecciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('contenido','cuestionario') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci,
  `videoUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL,
  `notaMinima` int DEFAULT NULL,
  `cursoId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cursoId` (`cursoId`),
  CONSTRAINT `lecciones_ibfk_1` FOREIGN KEY (`cursoId`) REFERENCES `cursos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecciones`
--

LOCK TABLES `lecciones` WRITE;
/*!40000 ALTER TABLE `lecciones` DISABLE KEYS */;
INSERT INTO `lecciones` VALUES (1,'Conociendo los numeros','contenido','Aprenderemos los numeros del 1 al 100.',NULL,1,NULL,1),(2,'Aprendiendo a sumar','contenido','Aprenderemos a sumar numeros de una cifra.',NULL,2,NULL,1),(3,'Aprendiendo a restar','contenido','Aprenderemos a realizar restas sencillas.',NULL,3,NULL,1),(4,'¿Qué es sumar?','contenido','Sumar significa reunir cantidades. Dibuja 3 manzanas y luego 2 más. Cuenta todas y escribe 3 + 2 = 5.','https://www.youtube.com/watch?v=xvyn-FfcQp4',1,NULL,2),(5,'Sumas con decenas','contenido','Ordena unidades debajo de unidades y decenas debajo de decenas. Resuelve 24 + 13 y comprueba que obtienes 37.',NULL,2,NULL,2),(6,'¿Qué es restar?','contenido','Restar significa quitar o calcular una diferencia. Si tienes 9 lápices y regalas 4, te quedan 5. Practica con objetos de tu casa.',NULL,3,NULL,2),(7,'Problemas cotidianos','contenido','Ana tiene 12 figuritas, recibe 5 y regala 3. Escribe las dos operaciones necesarias para descubrir cuántas conserva.',NULL,4,NULL,2),(8,'Repaso de sumas y restas','contenido','Vuelve al video y resuelve 8 + 6, 17 - 9 y 25 + 12. Explica cuándo necesitas sumar y cuándo restar.','https://www.youtube.com/watch?v=xvyn-FfcQp4',5,NULL,2),(9,'Grupos iguales','contenido','Tres grupos de cuatro fichas contienen doce fichas. Dibuja los grupos y escribe 3 × 4 = 12.','https://www.youtube.com/watch?v=3QPpyuNycQI',1,NULL,3),(10,'Tablas del 2, 5 y 10','contenido','Practica contando de dos en dos, de cinco en cinco y de diez en diez. Completa 2 × 6, 5 × 4 y 10 × 7.',NULL,2,NULL,3),(11,'Tablas del 3 y del 4','contenido','Construye filas de 3 y 4 objetos. Comprueba que 3 × 4 y 4 × 3 dan el mismo total.',NULL,3,NULL,3),(12,'Repartir en partes iguales','contenido','Si repartes 20 fichas entre 4 personas por igual, cada una recibe 5. Representa el reparto y escribe la división.',NULL,4,NULL,3),(13,'Repaso de multiplicación y división','contenido','Revisa el video y resuelve 4 × 5, 18 ÷ 3 y 30 ÷ 5. Inventa un problema de reparto.','https://www.youtube.com/watch?v=3QPpyuNycQI',5,NULL,3),(14,'Nuestro sistema solar','contenido','El sistema solar está formado por el Sol y los cuerpos que orbitan a su alrededor. Dibuja el Sol y los ocho planetas.','https://www.youtube.com/watch?v=pS7p6FfU4bE',1,NULL,4),(15,'Los planetas interiores','contenido','Mercurio, Venus, Tierra y Marte son planetas rocosos. Ordénalos desde el más cercano al Sol.',NULL,2,NULL,4),(16,'Los planetas exteriores','contenido','Júpiter y Saturno son gigantes gaseosos; Urano y Neptuno son gigantes helados. Investiga qué planeta tiene los anillos más visibles.',NULL,3,NULL,4),(17,'La Tierra y la Luna','contenido','La Tierra gira sobre su eje y también alrededor del Sol. La Luna orbita la Tierra. Dibuja los tres movimientos con flechas.',NULL,4,NULL,4),(18,'Viaje por los ocho planetas','contenido','Observa el video de repaso y prepara una ficha con una característica de cada planeta.','https://www.youtube.com/watch?v=tYbFuElOg3Q',5,NULL,4),(19,'El ciclo del agua','contenido','El agua circula continuamente entre la superficie y la atmósfera. Dibuja un ciclo con nubes, montañas y un río.','https://www.youtube.com/watch?v=QDCohXW6blg',1,NULL,5),(20,'Los estados del agua','contenido','El hielo es agua sólida, el agua que bebemos es líquida y el vapor se encuentra en estado gaseoso. Describe un ejemplo de cada estado.',NULL,2,NULL,5),(21,'Evaporación y condensación','contenido','El calor facilita la evaporación. Al enfriarse el vapor, puede convertirse en pequeñas gotas. Observa las gotas que aparecen fuera de un vaso frío.',NULL,3,NULL,5),(22,'Precipitación y acumulación','contenido','El agua puede caer como lluvia, nieve o granizo. Después circula por el suelo, los ríos o el subsuelo. Dibuja su recorrido hasta el mar.',NULL,4,NULL,5),(23,'Repaso y cuidado del agua','contenido','Revisa el video y explica tres etapas del ciclo. Propón cerrar el grifo al cepillarte y otras dos acciones de ahorro.','https://www.youtube.com/watch?v=QDCohXW6blg',5,NULL,5),(24,'Conociendo las figuras','contenido','Observa las figuras del video y busca objetos con formas parecidas en tu habitación.','https://www.youtube.com/watch?v=SXONzObzFk0',1,NULL,6),(25,'Círculos y triángulos','contenido','El círculo es una figura redonda. El triángulo tiene tres lados y tres vértices. Dibuja tres ejemplos de cada uno.',NULL,2,NULL,6),(26,'Cuadrados y rectángulos','contenido','Ambas figuras tienen cuatro lados y cuatro ángulos rectos. En el cuadrado todos los lados son iguales. Compara una ventana y una hoja.',NULL,3,NULL,6),(27,'Lados, vértices y simetría','contenido','Marca con puntos los vértices de un polígono. Dobla una figura de papel para comprobar si dos partes coinciden.',NULL,4,NULL,6),(28,'Repaso geométrico','contenido','Regresa al video y crea una casa con triángulos, rectángulos, cuadrados y círculos. Cuenta cuántas figuras de cada clase utilizaste.','https://www.youtube.com/watch?v=SXONzObzFk0',5,NULL,6),(29,'Clasificación de los animales','contenido','Los vertebrados tienen columna vertebral; los invertebrados no. Clasifica un perro, una mariposa y un pez.','https://www.youtube.com/watch?v=swoNNbF23aU',1,NULL,7),(30,'Mamíferos y aves','contenido','Los mamíferos alimentan a sus crías con leche. Las aves tienen plumas. Describe semejanzas y diferencias entre un gato y una paloma.',NULL,2,NULL,7),(31,'Peces, reptiles y anfibios','contenido','Los peces viven en el agua, muchos reptiles tienen escamas y los anfibios suelen vivir parte de su vida en ambientes acuáticos. Busca un ejemplo de cada grupo.',NULL,3,NULL,7),(32,'Animales invertebrados','contenido','Insectos, moluscos y otros grupos no tienen columna vertebral. Dibuja una hormiga y un caracol y señala sus diferencias.',NULL,4,NULL,7),(33,'Repaso de clasificación animal','contenido','Revisa el video y organiza diez animales en una tabla de vertebrados e invertebrados. Incluye ejemplos de Bolivia.','https://www.youtube.com/watch?v=swoNNbF23aU',5,NULL,7),(34,'Los sistemas del cuerpo','contenido','El cuerpo está organizado en órganos que trabajan juntos. Observa el video por secciones y anota qué sistemas reconoces.','https://www.youtube.com/watch?v=fGE4HzYPPaY',1,NULL,8),(35,'Huesos y músculos','contenido','Los huesos sostienen el cuerpo y los músculos permiten el movimiento. Flexiona tu brazo y describe lo que ocurre.',NULL,2,NULL,8),(36,'El aparato respiratorio','contenido','Al respirar entra aire en los pulmones, donde el oxígeno pasa a la sangre. Dibuja el recorrido del aire desde la nariz.',NULL,3,NULL,8),(37,'Digestión y circulación','contenido','El aparato digestivo transforma los alimentos y la circulación transporta nutrientes y oxígeno. Explica por qué ambos procesos son necesarios.',NULL,4,NULL,8),(38,'Repaso de los sistemas','contenido','Consulta las secciones del video correspondientes a los sistemas estudiados. Elabora un esquema con el nombre, los órganos y una función de cada sistema.','https://www.youtube.com/watch?v=fGE4HzYPPaY',5,NULL,8),(39,'Las tres erres','contenido','Reducir, reutilizar y reciclar son hábitos para disminuir los residuos. Escribe una acción de cada tipo que puedas realizar esta semana.','https://www.youtube.com/watch?v=EiKEpstqGuw',1,NULL,9),(40,'Reducir el consumo','contenido','Elige únicamente lo necesario y evita productos de un solo uso cuando sea posible. Compara una botella reutilizable con varias botellas desechables.',NULL,2,NULL,9),(41,'Reutilizar materiales','contenido','Antes de desechar un objeto piensa si puede tener otro uso. Con ayuda de un adulto, transforma una caja en un organizador de lápices.',NULL,3,NULL,9),(42,'Separar para reciclar','contenido','Separa papel, cartón, plástico y vidrio de acuerdo con la recolección disponible en tu municipio. Nunca manipules residuos peligrosos.',NULL,4,NULL,9),(43,'Reto ecológico de la semana','contenido','Observa el video de repaso y diseña un cartel con tres acciones para mejorar el cuidado del ambiente en tu curso.','https://www.youtube.com/watch?v=3Wa3eRaCoNA',5,NULL,9),(44,'Las emociones básicas','contenido','Las emociones nos ayudan a comprender lo que sucede. Reconoce alegría, tristeza, miedo, enojo, asco y sorpresa en las situaciones del video.','https://www.youtube.com/watch?v=qBZSlGo4N1k',1,NULL,10),(45,'Alegría y tristeza','contenido','Expresar alegría o tristeza está bien. Dibuja algo que te haga sentir feliz y piensa a quién puedes pedir apoyo cuando estás triste.',NULL,2,NULL,10),(46,'Miedo y enojo','contenido','Cuando tienes miedo o enojo, puedes respirar con calma, expresar lo que sientes y buscar la ayuda de un adulto de confianza.',NULL,3,NULL,10),(47,'Escuchar y respetar','contenido','La empatía consiste en intentar comprender cómo se siente otra persona. Practica escuchar a un compañero sin interrumpir.',NULL,4,NULL,10),(48,'Mi diario de emociones','contenido','Después del video, escribe cómo te sentiste hoy, qué lo provocó y qué acción respetuosa te ayudó a manejar esa emoción.','https://www.youtube.com/watch?v=xuU_cCFOFA0',5,NULL,10),(49,'Cuidar nuestra salud','contenido','Los hábitos cotidianos ayudan a mantener nuestro bienestar. Observa el video por secciones y anota tres rutinas que puedes practicar.','https://www.youtube.com/watch?v=BRMi_mzrka8',1,NULL,11),(50,'Higiene personal','contenido','Lávate las manos con agua y jabón antes de comer y después de ir al baño. Cepilla tus dientes diariamente siguiendo las indicaciones de tu dentista.',NULL,2,NULL,11),(51,'Alimentación variada','contenido','Una alimentación variada aporta distintos nutrientes. Dibuja una comida que incluya frutas o verduras, una fuente de proteína y un cereal.',NULL,3,NULL,11),(52,'Movimiento y descanso','contenido','Jugar y moverte de manera segura fortalece tu cuerpo. Dormir lo suficiente te ayuda a recuperar energía y aprender. Diseña una rutina equilibrada.',NULL,4,NULL,11),(53,'Mi plan de hábitos saludables','contenido','Revisa las partes del video relacionadas con higiene y alimentación. Crea una tabla semanal de hábitos y marca los que practicas.','https://www.youtube.com/watch?v=BRMi_mzrka8',5,NULL,11);
/*!40000 ALTER TABLE `lecciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20261106000100-create-usuarios.js'),('20261106000200-create-cursos.js'),('20261106000300-create-lecciones.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('estudiante','instructor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `creadoEn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Mateo Alejandro Perez','mateo.nuevo@example.com','$2b$12$QqUBYFxNt8MdD9k2jSUJ..qLLnxTxn8ctncb7Hzwl25AiC5pJgnU.','estudiante','2026-11-12 00:09:41'),(2,'Laura Gomez','laura.prueba@example.com','$2b$12$wRymCqJ9yGvxPwvSyuN9c..0vw7eJh2St9dzXqMn0bUrwC4EfFHLK','instructor','2026-11-12 00:19:49'),(3,'Pedro Martinez','pedro.prueba@example.com','$2b$12$xaZ0xGTbffHbj/5jdFNn/eVhWr5kt2MEhEhHZGrswgCCuj.lhs9lC','instructor','2026-11-17 23:08:43'),(4,'Sofia Rojas','sofia.demo@example.com','$2b$12$IOcJj8dyajGTrVhexlq1Ku7EeWQXool/sNI0jdiP5kpw.GWJAjnw6','estudiante','2026-11-17 23:08:43'),(5,'Diego Flores','diego.demo@example.com','$2b$12$A7nqgHMZADgTSfDqEaiMZ.R7ENU1QCRO.ex5IGD5D8BzzW.dJAjr2','estudiante','2026-11-17 23:08:43'),(6,'Valentina Paz','valentina.demo@example.com','$2b$12$Iuwer9jFKgjs0oNeYoARLeyIyW0H8/aYEFIg2YFQnGWAuA6PdY6bi','estudiante','2026-11-17 23:08:43');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 23:15:32
