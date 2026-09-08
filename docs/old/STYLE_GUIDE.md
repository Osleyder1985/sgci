# STYLE_GUIDE.md
## Guía de Estilo de Código del SGCI (Sistema de Gestión Contextualmente Inteligente)

**Versión:** 1.0
**Fecha:** 25 de agosto de 2026
**Estado:** Documento de referencia para el desarrollo del SGCI
**Referencia:** Este documento es independiente y complementa el Capítulo 7 del Plan de Implementación

---

## Índice

1. [Principios Generales](#1-principios-generales)
2. [TypeScript/JavaScript](#2-typescriptjavascript)
3. [React/Next.js](#3-reactnextjs)
4. [React Native (Mobile)](#4-react-native-mobile)
5. [Python (Machine Learning)](#5-python-machine-learning)
6. [SQL/Prisma](#6-sqlprisma)
7. [Estructura de Archivos y Carpetas](#7-estructura-de-archivos-y-carpetas)
8. [Convenciones de Nombres](#8-convenciones-de-nombres)
9. [Documentación y Comentarios](#9-documentación-y-comentarios)
10. [Control de Versiones (Git)](#10-control-de-versiones-git)
11. [Herramientas de Calidad de Código](#11-herramientas-de-calidad-de-código)
12. [Checklist de Calidad de Código](#12-checklist-de-calidad-de-código)

---

## 1. Principios Generales

### 1.1. Filosofía de Desarrollo

| Principio | Descripción |
| :--- | :--- |
| **YAGNI (You Aren't Gonna Need It)** | No implementes funcionalidades que no sean necesarias ahora. Las tablas se crean solo cuando la funcionalidad se desarrolla. |
| **DRY (Don't Repeat Yourself)** | No dupliques código. Extrae lógica común a funciones, hooks o utilidades reutilizables. |
| **KISS (Keep It Simple, Stupid)** | Prefiere soluciones simples sobre soluciones complejas. La complejidad debe estar justificada. |
| **SOLID** | Aplica los principios de diseño orientado a objetos donde sea relevante. |
| **Clean Code** | El código debe ser legible, mantenible y auto-documentado. |

### 1.2. Estándares de Formato

| Aspecto | Estándar |
| :--- | :--- |
| **Indentación** | 2 espacios (no tabs) |
| **Longitud de línea** | Máximo 100 caracteres (printWidth: 100) |
| **Comillas** | Simples (`'`) para strings, dobles (`"`) para JSX attributes |
| **Punto y coma** | Obligatorio (`semi: true`) |
| **Coma final** | `es5` (comas en objetos y arrays, excepto en funciones) |
| **Salto de línea** | `LF` (Unix) |

### 1.3. Convenciones de Nombres

| Tipo | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Archivos** | kebab-case | `user-profile.tsx` |
| **Carpetas** | kebab-case | `components/features/` |
| **Componentes** | PascalCase | `UserProfile`, `DashboardLayout` |
| **Funciones** | camelCase | `getUserById`, `handleSubmit` |
| **Variables** | camelCase | `userName`, `isLoading` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| **Tipos/Interfaces** | PascalCase | `UserProfileProps`, `ApiResponse` |
| **Enums** | PascalCase | `UserRole`, `OrderStatus` |
| **Atributos HTML** | kebab-case | `data-testid`, `aria-label` |
| **Clases CSS** | kebab-case (Tailwind) | `bg-blue-500`, `text-center` |
| **Variables de entorno** | UPPER_SNAKE_CASE | `NEXTAUTH_URL`, `DATABASE_URL` |

---

## 2. TypeScript/JavaScript

### 2.1. Tipado Estricto

**Regla:** Usar TypeScript en modo estricto (`strict: true`). Evitar `any` siempre que sea posible.

```typescript
// ✅ Correcto - Tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 'admin' | 'operador' | 'conductor';

// ✅ Correcto - Props con tipos
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

// ❌ Incorrecto - Uso de any
const user: any = { name: 'John' };

// ✅ Correcto - Uso de unknown cuando es necesario
const data: unknown = await fetchData();
if (isUser(data)) {
  // data es User aquí
}

// ✅ Correcto - Type narrowing con type guards
function isUser(data: unknown): data is User {
  return (data as User).id !== undefined;
}
```

### 2.2. Declaraciones

```typescript
// ✅ Correcto - Usar const sobre let
const name = 'John';
const MAX_ITEMS = 100;

// ✅ Correcto - Template strings
const message = `Hello ${name}, you have ${count} items`;

// ✅ Correcto - Arrow functions
const add = (a: number, b: number): number => a + b;

// ✅ Correcto - Destructuring
const { name, email } = user;
const [first, second] = items;

// ✅ Correcto - Spread operator
const newUser = { ...user, updatedAt: new Date() };
const allItems = [...items1, ...items2];

// ❌ Incorrecto - Concatenación manual
const message = 'Hello ' + name + ', you have ' + count + ' items';
```

### 2.3. Promesas y Async/Await

```typescript
// ✅ Correcto - Async/Await con manejo de errores
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw new AppError(500, 'FETCH_ERROR', 'Error al obtener el usuario');
  }
}

// ❌ Incorrecto - Promesas anidadas
function fetchUser(id: string) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .catch(error => console.error(error));
}

// ✅ Correcto - Promise.all para múltiples peticiones
const [user, permissions] = await Promise.all([
  fetchUser(id),
  fetchPermissions(id)
]);

// ❌ Incorrecto - Esperar secuencialmente
const user = await fetchUser(id);
const permissions = await fetchPermissions(id);
```

### 2.4. Módulos e Importaciones

```typescript
// ✅ Correcto - Importaciones ordenadas
// 1. React y Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Componentes de terceros
import { format } from 'date-fns';

// 3. Componentes internos (con @)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Hooks y utilidades
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

// 5. Tipos
import type { User, Order } from '@/types';

// ❌ Incorrecto - Importaciones desordenadas
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Button } from '@/components/ui/button';
```

### 2.5. Convenciones de Archivos

| Tipo de Archivo | Extensión | Ejemplo |
| :--- | :--- | :--- |
| Componente React | `.tsx` | `UserProfile.tsx` |
| Hook | `.ts` | `useAuth.ts` |
| Utilidad | `.ts` | `formatCurrency.ts` |
| Tipo/Interfaz | `.ts` | `types.ts` |
| Esquema Zod | `.ts` | `user.schema.ts` |
| Prueba | `.test.ts` o `.spec.ts` | `user.test.ts` |
| API Route | `.ts` | `route.ts` |
| Middleware | `.ts` | `auth.ts` |

### 2.6. Reglas de ESLint Específicas

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  }
}
```

---

## 3. React/Next.js

### 3.1. Server vs Client Components

```tsx
// ✅ Correcto - Server Component (por defecto)
// app/users/page.tsx
import { prisma } from '@/lib/prisma';
import { UserList } from '@/components/UserList';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });
  return <UserList users={users} />;
}

// ✅ Correcto - Client Component (cuando se necesita interactividad)
// components/UserList.tsx
'use client';

import { useState } from 'react';

export function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);
  // ...
}
```

### 3.2. Estructura de Componentes

```tsx
// ✅ Correcto - Orden en el componente
import { useState, useEffect } from 'react';

// 1. Tipos/Interfaces
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 2. Componente
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 3. Hooks
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 4. Funciones
  const handleUpdate = async (data: Partial<User>) => {
    // ...
  };
  
  // 5. Efectos
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  // 6. Renderizado condicional
  if (isLoading) {
    return <Skeleton className="h-32" />;
  }
  
  if (!user) {
    return <div>Usuario no encontrado</div>;
  }
  
  // 7. Renderizado
  return (
    <div className="p-4 border rounded-lg">
      {/* ... */}
    </div>
  );
}
```

### 3.3. Hooks

```typescript
// ✅ Correcto - useEffect con dependencias correctas
useEffect(() => {
  fetchUser(userId);
}, [userId]); // userId es la dependencia correcta

// ❌ Incorrecto - useEffect sin dependencias
useEffect(() => {
  fetchUser(userId);
}); // Se ejecuta en cada render

// ✅ Correcto - useMemo para valores computados
const filteredUsers = useMemo(() => {
  return users.filter(user => user.name.includes(search));
}, [users, search]);

// ✅ Correcto - useCallback para funciones
const handleUpdate = useCallback((user: User) => {
  updateUser(user);
}, []); // Dependencias vacías si no usa variables externas

// ✅ Correcto - Custom Hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return { user, isLoading, error };
}
```

### 3.4. Accesibilidad (a11y)

```tsx
// ✅ Correcto - Elementos accesibles
<button
  aria-label="Cerrar modal"
  onClick={handleClose}
  className="p-2 rounded-full hover:bg-gray-100"
>
  <CloseIcon />
</button>

// ✅ Correcto - Formularios con labels
<label htmlFor="email" className="block text-sm font-medium">
  Correo electrónico
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-description"
  className="mt-1 block w-full rounded-md border-gray-300"
/>

// ✅ Correcto - Imágenes con alt
<Image
  src="/logo.png"
  alt="Logo de Seta Expreso"
  width={100}
  height={100}
  priority
/>

// ❌ Incorrecto - Sin alt
<Image src="/logo.png" width={100} height={100} />
```

### 3.5. Optimización de Rendimiento

```tsx
// ✅ Correcto - Lazy loading de componentes pesados
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ✅ Correcto - Optimización de imágenes
<Image
  src="/vehicle-photo.jpg"
  alt="Vehículo Gazelle"
  width={800}
  height={600}
  priority={true}
  className="object-cover"
/>

// ✅ Correcto - Virtualización para listas largas
import { useVirtualizer } from '@tanstack/react-virtual';

function LongList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  });
  // ...
}

// ✅ Correcto - Next.js Image con caching
<Image
  src={imageUrl}
  alt="Vehicle"
  width={300}
  height={200}
  quality={80}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  unoptimized={process.env.NODE_ENV === 'development'}
/>
```

---

## 4. React Native (Mobile)

### 4.1. Estructura de Componentes Móviles

```tsx
// ✅ Correcto - Componente React Native
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface DriverCardProps {
  driver: Driver;
  onPress?: () => void;
}

export function DriverCard({ driver, onPress }: DriverCardProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('DriverDetails', { id: driver.id });
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.container}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.status}>{driver.status}</Text>
        <Text style={styles.vehicle}>Vehículo: {driver.vehicle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ✅ Correcto - Estilos con StyleSheet
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  status: {
    fontSize: 14,
    color: '#4a5568',
  },
  vehicle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
});
```

### 4.2. Offline-First en Mobile

```typescript
// ✅ Correcto - Hook para manejar datos offline
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

function useDeliveries(routeId: string) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isOnline, setIsOnline] = useState(network.isConnected);
  const { getOffline, saveOffline } = useOfflineStorage();

  // ✅ Correcto - Estrategia Offline-First
  const loadDeliveries = async () => {
    // 1. Intentar cargar desde caché local
    const localData = await getOffline<Delivery[]>(`deliveries:${routeId}`);
    
    if (localData) {
      setDeliveries(localData);
      
      // 2. Si hay conexión, actualizar en segundo plano
      if (isOnline) {
        try {
          const freshData = await api.getDeliveries(routeId);
          await saveOffline(`deliveries:${routeId}`, freshData);
          setDeliveries(freshData);
        } catch (error) {
          console.warn('Failed to refresh deliveries:', error);
        }
      }
    } else {
      // 3. Sin datos locales, obtener del servidor
      try {
        const freshData = await api.getDeliveries(routeId);
        await saveOffline(`deliveries:${routeId}`, freshData);
        setDeliveries(freshData);
      } catch (error) {
        throw new Error('No hay datos disponibles y no hay conexión');
      }
    }
  };

  // ✅ Correcto - Manejo de conflictos
  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    const optimisticDelivery = deliveries.find(d => d.id === deliveryId);
    if (!optimisticDelivery) return;

    // Actualización optimista
    const updatedDeliveries = deliveries.map(d => 
      d.id === deliveryId ? { ...d, status } : d
    );
    setDeliveries(updatedDeliveries);

    // Guardar en cola de sincronización
    await saveOffline(`pending:${deliveryId}`, {
      id: deliveryId,
      status,
      timestamp: Date.now(),
    });

    // Intentar sincronizar si hay conexión
    if (isOnline) {
      try {
        await api.updateDeliveryStatus(deliveryId, status);
        await removeOffline(`pending:${deliveryId}`);
      } catch (error) {
        console.warn('Failed to sync update:', error);
      }
    }
  };

  return { deliveries, loadDeliveries, updateDeliveryStatus };
}
```

### 4.3. Diferencias Android vs iOS

```typescript
// ✅ Correcto - Detección de plataforma
import { Platform } from 'react-native';

const getPlatformSpecificStyles = () => ({
  paddingVertical: Platform.OS === 'ios' ? 12 : 16,
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  elevation: Platform.OS === 'android' ? 4 : 0,
  shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
});

// ✅ Correcto - Permisos específicos por plataforma
import { PermissionsAndroid } from 'react-native';

async function requestLocationPermissions() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permiso de ubicación',
        message: 'La app necesita acceder a tu ubicación para el seguimiento de entregas.',
        buttonNeutral: 'Preguntar después',
        buttonNegative: 'Cancelar',
        buttonPositive: 'Aceptar',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  // iOS - usar @react-native-community/geolocation
  return true;
}

// ✅ Correcto - Notificaciones push por plataforma
import messaging from '@react-native-firebase/messaging';

async function setupPushNotifications() {
  if (Platform.OS === 'android') {
    // Configuración específica de Android
    await messaging().setAutoInitEnabled(true);
    await messaging().registerForRemoteMessages();
  } else {
    // iOS - requiere permiso explícito
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      console.warn('Notificaciones no autorizadas');
    }
  }
}
```

---

## 5. Python (Machine Learning)

### 5.1. Estilo de Código

```python
# ✅ Correcto - Docstring y tipos
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class DemandPredictor:
    """
    Predictor de demanda utilizando Prophet y XGBoost.
    
    Este predictor utiliza modelos estadísticos y de machine learning
    para predecir la demanda de servicios de transporte.
    
    Attributes:
        prophet_model: Modelo Prophet entrenado
        xgb_model: Modelo XGBoost entrenado
        last_training_date: Fecha del último entrenamiento
    """
    
    def __init__(self, config: Dict[str, Any]) -> None:
        """
        Inicializa el predictor con configuración.
        
        Args:
            config: Diccionario con configuración del modelo
                - model_type: 'prophet' | 'xgboost' | 'ensemble'
                - training_days: Número de días para entrenamiento
                - forecast_days: Número de días para predicción
        
        Raises:
            ValueError: Si la configuración es inválida
        """
        self.config = config
        self.prophet_model = None
        self.xgb_model = None
        self.last_training_date = None
        
        if 'model_type' not in config:
            raise ValueError("Missing 'model_type' in config")
    
    def train(self, data: pd.DataFrame) -> Dict[str, float]:
        """
        Entrena los modelos con los datos proporcionados.
        
        Args:
            data: DataFrame con datos históricos
                Columnas requeridas: ['ds', 'y', 'features']
        
        Returns:
            Diccionario con métricas de rendimiento
                - accuracy: Precisión del modelo
                - mape: Error porcentual absoluto medio
                - rmse: Raíz del error cuadrático medio
        """
        # Validación de datos
        required_cols = ['ds', 'y']
        for col in required_cols:
            if col not in data.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Procesamiento
        data['ds'] = pd.to_datetime(data['ds'])
        data['y'] = pd.to_numeric(data['y'])
        
        # Entrenamiento
        # ...
        
        return {
            'accuracy': 0.95,
            'mape': 0.05,
            'rmse': 2.35
        }
    
    def predict(self, days_ahead: int) -> List[Dict[str, Any]]:
        """
        Genera predicciones para los próximos días.
        
        Args:
            days_ahead: Número de días a predecir
        
        Returns:
            Lista de diccionarios con predicciones
        """
        if self.prophet_model is None:
            raise RuntimeError("Model not trained. Call train() first.")
        
        if days_ahead <= 0 or days_ahead > 90:
            raise ValueError("days_ahead must be between 1 and 90")
        
        # Predicción
        future_dates = pd.date_range(
            start=datetime.now(),
            periods=days_ahead,
            freq='D'
        )
        
        predictions = []
        for date in future_dates:
            predictions.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted': np.random.randint(100, 200),
                'confidence': 0.95
            })
        
        return predictions
```

### 5.2. Convenciones de Python

| Aspecto | Estándar |
| :--- | :--- |
| **PEP 8** | Seguir las guías de estilo de Python |
| **Documentación** | Docstrings en formato Google o NumPy |
| **Tipado** | Usar type hints siempre que sea posible |
| **Archivos** | `snake_case.py` |
| **Clases** | `PascalCase` |
| **Funciones** | `snake_case` |
| **Variables** | `snake_case` |

### 5.3. Gestión de Dependencias

```txt
# requirements.txt - Dependencias principales
prophet==1.1.5
xgboost==2.0.3
pandas==2.1.4
numpy==1.26.3
scikit-learn==1.3.2
joblib==1.3.2
psycopg2-binary==2.9.9
mlflow==2.9.2
```

```bash
# ✅ Correcto - Entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install -r requirements.txt

# ✅ Correcto - Exportar dependencias
pip freeze > requirements.txt
```

---

## 6. SQL/Prisma

### 6.1. Convenciones SQL

```sql
-- ✅ Correcto - Nombres en snake_case
CREATE TABLE guias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_awb VARCHAR(50) UNIQUE,
    fecha_emision TIMESTAMP,
    fecha_importacion TIMESTAMP DEFAULT NOW(),
    consignatario VARCHAR(200) NOT NULL,
    estado VARCHAR(20) DEFAULT 'creada',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ✅ Correcto - Índices con prefijo
CREATE INDEX idx_guias_estado ON guias(estado);
CREATE INDEX idx_guias_agencia_fecha ON guias(agencia_id, fecha_emision);
CREATE INDEX idx_guias_codigo_awb ON guias(codigo_awb);

-- ✅ Correcto - Índices parciales
CREATE INDEX idx_guias_activas ON guias(estado, fecha_emision)
WHERE estado NOT IN ('entregada', 'archivada');

-- ✅ Correcto - Índices de cobertura
CREATE INDEX idx_guias_listado ON guias(agencia_id, estado, fecha_emision)
INCLUDE (codigo_awb, consignatario, peso_total_kg);

-- ❌ Incorrecto - Nombres en PascalCase
CREATE TABLE Guias (
    Id UUID PRIMARY KEY,
    CodigoAwb VARCHAR(50) UNIQUE,
    FechaEmision TIMESTAMP
);
```

### 6.2. Prisma Schema

```prisma
// ✅ Correcto - Schema Prisma
model Guia {
  id                String    @id @default(cuid())
  codigoAwb         String    @unique @map("codigo_awb")
  agenciaId         String    @map("agencia_id")
  fechaEmision      DateTime  @map("fecha_emision")
  fechaImportacion  DateTime  @default(now()) @map("fecha_importacion")
  pesoTotalKg       Float     @map("peso_total_kg")
  cantidadBultos    Int       @map("cantidad_bultos")
  consignatario     String
  estado            EstadoGuia @default(creada)
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  createdBy         String?   @map("created_by")
  updatedBy         String?   @map("updated_by")

  agencia AgenciaEnvios @relation(fields: [agenciaId], references: [id])
  bultos  Bulto[]

  @@index([codigoAwb])
  @@index([agenciaId, fechaEmision])
  @@index([estado])
  @@map("guias")
}

// ✅ Correcto - Enums
enum EstadoGuia {
  creada
  enviada
  arribo
  proceso_aduana
  facturada
  recibida
  proceso_transportacion
  proceso_entrega
  parcialmente_entregada
  entregada
  archivada
}
```

### 6.3. Mejores Prácticas de Consultas

```typescript
// ✅ Correcto - Select específico
const guias = await prisma.guia.findMany({
  select: {
    id: true,
    codigoAwb: true,
    consignatario: true,
    estado: true,
    agencia: {
      select: { nombre: true }
    }
  },
  where: { estado: 'creada' }
});

// ❌ Incorrecto - Traer datos innecesarios
const guias = await prisma.guia.findMany({
  include: { bultos: true, agencia: true, notificaciones: true }
});

// ✅ Correcto - Paginación
const guias = await prisma.guia.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { fechaEmision: 'desc' }
});

// ✅ Correcto - Transacciones
const result = await prisma.$transaction(async (tx) => {
  const guia = await tx.guia.create({ data: { ... } });
  const bultos = await tx.bulto.createMany({ data: bultosData });
  return { guia, bultos };
});

// ✅ Correcto - JSONB Query
const rutas = await prisma.ruta.findMany({
  where: {
    puntosEntregaLat: {
      // JSONB contains query
      path: ['$'],
      array_contains: [23.1136, -82.3666]
    }
  }
});
```

---

## 7. Estructura de Archivos y Carpetas

### 7.1. Frontend (Next.js)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── guias/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── importar/
│   │   │       └── page.tsx
│   │   ├── bultos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── vehiculos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── rutas/
│   │   │   ├── page.tsx
│   │   │   └── optimizar/
│   │   │       └── page.tsx
│   │   ├── reportes/
│   │   │   ├── page.tsx
│   │   │   └── [tipo]/
│   │   │       └── page.tsx
│   │   └── analytics/
│   │       ├── page.tsx
│   │       └── dashboard/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── guias/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── importar/
│   │   │       └── route.ts
│   │   ├── bultos/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── reports/
│   │       ├── dashboard/
│   │       │   └── route.ts
│   │       └── sustainability/
│   │           └── [year]/
│   │               └── route.ts
│   └── layout.tsx
├── components/
│   ├── ui/          # Componentes reutilizables (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── features/    # Componentes por funcionalidad
│   │   ├── guias/
│   │   │   ├── GuiaList.tsx
│   │   │   ├── GuiaForm.tsx
│   │   │   └── GuiaTracking.tsx
│   │   ├── bultos/
│   │   │   ├── BultoList.tsx
│   │   │   └── BultoMap.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── TrendChart.tsx
│   │   └── reports/
│   │       ├── FichaCostoReport.tsx
│   │       └── SustainabilityReport.tsx
│   └── shared/      # Componentes compartidos
│       ├── Map.tsx
│       ├── Layout/
│       └── Skeleton/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── cache.ts
│   ├── logger.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   └── validators.ts
│   ├── validations/
│   │   ├── guia.schema.ts
│   │   └── user.schema.ts
│   └── middleware/
│       ├── auth.ts
│       ├── error-handler.ts
│       └── rate-limit.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useOffline.ts
├── types/
│   ├── index.ts
│   ├── guia.ts
│   ├── bulto.ts
│   └── api.ts
└── styles/
    ├── globals.css
    └── tailwind.config.ts
```

### 7.2. Backend (API)

```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
├── guias/
│   ├── route.ts          # GET (listar), POST (crear)
│   ├── [id]/
│   │   ├── route.ts      # GET, PUT, DELETE
│   │   └── estado/
│   │       └── route.ts  # PUT (actualizar estado)
│   └── importar/
│       └── route.ts      # POST (importar manifiesto)
├── bultos/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── ubicacion/
│       │   └── route.ts
│       └── estado/
│           └── route.ts
├── clientes/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── vehiculos/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── rutas/
│   ├── route.ts
│   ├── generar/
│   │   └── route.ts
│   └── [id]/
│       ├── route.ts
│       └── modificar/
│           └── route.ts
├── reports/
│   ├── dashboard/
│   │   └── route.ts
│   ├── ficha-costo/
│   │   └── route.ts
│   ├── sustainability/
│   │   └── [year]/
│   │       └── route.ts
│   └── exports/
│       └── route.ts
├── analytics/
│   ├── dashboard/
│   │   └── route.ts
│   ├── predict/
│   │   ├── demand/
│   │   │   └── route.ts
│   │   └── maintenance/
│   │       └── route.ts
│   └── warehouse/
│       └── refresh/
│           └── route.ts
└── webhooks/
    └── [id]/
        └── route.ts
```

### 7.3. Mobile (React Native)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (driver)/
│   │   ├── dashboard/
│   │   ├── deliveries/
│   │   ├── routes/
│   │   └── profile/
│   ├── (client)/
│   │   ├── tracking/
│   │   ├── packages/
│   │   └── profile/
│   └── _layout.tsx
├── components/
│   ├── ui/          # UI reutilizable (React Native Paper)
│   ├── features/    # Componentes por funcionalidad
│   │   ├── deliveries/
│   │   ├── routes/
│   │   └── tracking/
│   └── shared/
├── hooks/
│   ├── useAuth.ts
│   ├── useOffline.ts
│   ├── useGPS.ts
│   └── useNotifications.ts
├── lib/
│   ├── api.ts
│   ├── offline/
│   │   ├── storage.ts
│   │   ├── sync.ts
│   │   └── conflicts.ts
│   └── constants.ts
├── store/           # Zustand
│   ├── auth.store.ts
│   └── deliveries.store.ts
├── types/
│   ├── index.ts
│   └── navigation.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

### 7.4. Backend ML (Python)

```
services/ml/
├── __init__.py
├── demand_prediction.py
├── predictive_maintenance.py
├── models/
│   ├── __init__.py
│   ├── prophet_model.pkl
│   └── xgboost_model.pkl
├── data/
│   ├── __init__.py
│   └── training_data.csv
├── tests/
│   └── test_models.py
└── requirements.txt
```

---

## 8. Convenciones de Nombres Detalladas

### 8.1. Componentes UI

| Tipo | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Página** | `PageName` + `Page` | `UsersPage`, `GuiaPage` |
| **Componente** | `NombreSignificativo` | `UserList`, `GuiaForm` |
| **Modal/Dialog** | `Nombre` + `Modal` | `ConfirmModal`, `FilterModal` |
| **Layout** | `Nombre` + `Layout` | `DashboardLayout`, `AuthLayout` |
| **Card** | `Nombre` + `Card` | `UserCard`, `DeliveryCard` |
| **List** | `Nombre` + `List` | `UserList`, `DeliveryList` |
| **Form** | `Nombre` + `Form` | `UserForm`, `GuiaForm` |
| **Chart** | `Nombre` + `Chart` | `RevenueChart`, `TrendChart` |

### 8.2. Hooks

```typescript
// ✅ Correcto - Nombres de hooks
const useAuth = () => { ... };
const useUser = (userId: string) => { ... };
const useOffline = () => { ... };
const useGPS = () => { ... };
const useNotifications = () => { ... };

// ✅ Correcto - Hooks con valores de retorno tipados
interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useUser(userId: string): UseUserResult {
  // ...
}
```

### 8.3. Utilidades

```typescript
// ✅ Correcto - Nombres de utilidades
function formatCurrency(amount: number, currency: string = 'CUP'): string { ... }
function formatDate(date: Date | string): string { ... }
function validateEmail(email: string): boolean { ... }
function sanitizeInput(input: string): string { ... }
function generateId(): string { ... }
function getStatusColor(status: string): string { ... }
```

### 8.4. Variables de Entorno

```env
# ✅ Correcto - Variables de entorno
NEXTAUTH_URL="https://api.setaexpreso.cu"
NEXTAUTH_SECRET="secure-secret-key"

DATABASE_URL="postgresql://user:password@localhost:5432/sgci_db"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="jwt-secret-key"
JWT_REFRESH_SECRET="jwt-refresh-secret"
JWT_ACCESS_EXPIRY="1h"
JWT_REFRESH_EXPIRY="7d"

OSRM_URL="http://osrm:5000"
TRACCAR_URL="http://traccar:8083"
APPWRITE_ENDPOINT="http://appwrite:8082/v1"

LOCATIONIQ_API_KEY="pk.xxxxx"

# Next.js API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# ✅ Correcto - Variables solo en servidor (sin NEXT_PUBLIC)
DATABASE_URL
NEXTAUTH_SECRET
JWT_SECRET

# ✅ Correcto - Variables en cliente (con NEXT_PUBLIC)
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_MAPBOX_TOKEN
```

---

## 9. Documentación y Comentarios

### 9.1. Documentación de Archivos

```typescript
/**
 * @fileoverview Módulo de gestión de guías de envío.
 * Proporciona funcionalidades para crear, leer, actualizar y eliminar guías.
 * 
 * @module GuiaManagement
 * @requires next/navigation
 * @requires @/lib/prisma
 * @requires @/lib/validations/guia.schema
 * 
 * @author Osleyder González
 * @version 1.0.0
 * @since 2026-08-25
 */

// ✅ Correcto - Ejemplo completo
```

### 9.2. Documentación de Funciones

```typescript
/**
 * Obtiene una guía por su ID con todos sus bultos asociados.
 * 
 * @param id - ID de la guía a obtener
 * @param includeBultos - Si se deben incluir los bultos (default: true)
 * @returns La guía encontrada o null si no existe
 * @throws {AppError} Si el ID es inválido o hay un error de base de datos
 * @example
 * const guia = await getGuiaById('gui_12345', false);
 * console.log(guia?.codigoAwb);
 */
async function getGuiaById(id: string, includeBultos: boolean = true): Promise<Guia | null> {
  try {
    if (!id || id.length < 3) {
      throw new AppError(400, 'INVALID_ID', 'ID de guía inválido');
    }
    // ...
  } catch (error) {
    // ...
  }
}
```

### 9.3. Documentación de Componentes React

```tsx
/**
 * Componente para mostrar una lista de guías con paginación y filtros.
 * 
 * @component
 * @example
 * <GuiaList 
 *   limit={20}
 *   filters={{ estado: 'creada' }}
 *   onSelect={(guia) => console.log(guia)}
 * />
 */
interface GuiaListProps {
  /** Límite de guías por página */
  limit?: number;
  /** Filtros para la lista */
  filters?: {
    estado?: EstadoGuia;
    agenciaId?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  };
  /** Callback cuando se selecciona una guía */
  onSelect?: (guia: Guia) => void;
  /** Variante de visualización: 'table' | 'grid' */
  variant?: 'table' | 'grid';
}

export function GuiaList({ 
  limit = 20, 
  filters = {}, 
  onSelect,
  variant = 'table' 
}: GuiaListProps) {
  // ...
}
```

### 9.4. Documentación de APIs

```typescript
/**
 * @swagger
 * /api/guias:
 *   get:
 *     summary: Listar guías
 *     description: Obtiene una lista paginada de guías con filtros
 *     tags: [Guias]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [creada, enviada, arribo, proceso_aduana, facturada, recibida, proceso_transportacion, proceso_entrega, parcialmente_entregada, entregada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de guías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Guia'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const GET = withAuth(
  withCache(async (req) => {
    // ...
  }, { ttl: 300 })
);
```

---

## 10. Control de Versiones (Git)

### 10.1. Estructura de Branches

```
main               # Código en producción
  ├── develop      # Integración continua
  │   ├── feature/*   # Nuevas funcionalidades
  │   │   ├── feature/sgci-001-login
  │   │   ├── feature/sgci-002-guias
  │   │   └── feature/sgci-003-importacion
  │   └── release/*   # Preparación de versiones
  │       ├── release/v1.0.0
  │       └── release/v1.1.0
  └── hotfix/*     # Correcciones urgentes
      ├── hotfix/security-patch
      └── hotfix/critical-data-loss
```

### 10.2. Convención de Commits (Conventional Commits)

| Tipo | Propósito | Ejemplo |
| :--- | :--- | :--- |
| `feat` | Nueva funcionalidad | `feat(auth): agregar autenticación con JWT` |
| `fix` | Corrección de error | `fix(guias): corregir importación de manifiestos` |
| `docs` | Documentación | `docs(api): actualizar documentación OpenAPI` |
| `refactor` | Refactorización | `refactor(rutas): optimizar algoritmo de optimización` |
| `perf` | Mejora de rendimiento | `perf(bultos): optimizar consulta de bultos por guía` |
| `test` | Pruebas | `test(bultos): agregar pruebas unitarias` |
| `chore` | Mantenimiento | `chore(deps): actualizar dependencias` |
| `style` | Estilo de código | `style: aplicar formato Prettier a todos los archivos` |
| `ci` | CI/CD | `ci: configurar GitHub Actions para despliegue` |
| `revert` | Revertir commit | `revert: revertir commit abc123` |

### 10.3. Mensajes de Commit

```bash
# ✅ Correcto - Mensaje completo
feat(guias): agregar importación de manifiestos desde Excel

- Implementar lectura de archivos .xlsx y .xls
- Crear guías y bultos en una sola operación
- Agregar validación de datos duplicados
- Mostrar barra de progreso en tiempo real

Closes: #123
Reviewed-by: @osleyder

# ✅ Correcto - Mensaje corto
fix(bultos): corregir error al actualizar estado de bulto

# ❌ Incorrecto - Mensaje vago
fix: arreglar bug
```

### 10.4. Pull Requests

```markdown
# ✅ Correcto - Template de Pull Request

## 📋 Descripción
Implementa la importación de manifiestos desde archivos Excel.

## 🔗 Issue Relacionado
Closes #123

## 📝 Cambios Realizados
- [x] Implementar lectura de archivos .xlsx
- [x] Crear guías y bultos
- [x] Validar datos duplicados
- [x] Barra de progreso
- [ ] Pruebas unitarias (pendiente)

## 🧪 Pruebas Realizadas
- Importación de 100 bultos en 2.5 segundos
- Validación de duplicados

## 📸 Capturas de Pantalla
[Imagen del proceso]

## ✅ Checklist
- [x] El código sigue la guía de estilo
- [x] Se han añadido pruebas
- [x] La documentación ha sido actualizada
- [x] No hay errores de linting
- [x] Todas las pruebas pasan
```

---

## 11. Herramientas de Calidad de Código

### 11.1. ESLint Config

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: { react: { version: 'detect' } },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'prefer-const': 'error',
      'dot-notation': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'error',
    },
  },
  {
    ignores: [
      '.next/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },
  prettierConfig,
);
```

### 11.2. Prettier Config

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports"
  ],
  "importOrder": [
    "^react$",
    "^next(/.*)?$",
    "^@/app/(.*)$",
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^@/hooks/(.*)$",
    "^@/types/(.*)$",
    "^@/styles/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### 11.3. Husky + lint-staged

```javascript
// .lintstagedrc.js
import { ESLint } from 'eslint';

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const isIgnored = await Promise.all(
    files.map((file) => eslint.isPathIgnored(file))
  );
  return files.filter((_, i) => !isIgnored[i]);
};

export default {
  '*.{js,jsx,ts,tsx}': async (files) => {
    const filteredFiles = await removeIgnoredFiles(files);
    if (filteredFiles.length === 0) return [];

    return [
      `prettier --write ${filteredFiles.join(' ')}`,
      `eslint --max-warnings 0 ${filteredFiles.join(' ')}`,
      `tsc --noEmit`,
    ];
  },
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

### 11.4. SonarQube Quality Gates

| Métrica | Umbral | Consecuencia |
| :--- | :--- | :--- |
| **Bugs** | 0 | **Bloquea el PR** |
| **Vulnerabilidades** | 0 | **Bloquea el PR** |
| **Code Smells** | ≤ 50 | **Requiere revisión** |
| **Duplicación** | ≤ 3% | **Requiere refactorización** |
| **Cobertura de Tests** | ≥ 80% | **Requiere más pruebas** |
| **Complejidad Ciclomática** | ≤ 10 | **Requiere refactorización** |
| **Nuevos Issues** | 0 | **Bloquea el PR** |

### 11.5. Pruebas

```typescript
// ✅ Correcto - Prueba unitaria con Jest
import { render, screen, fireEvent } from '@testing-library/react';
import { GuiaList } from './GuiaList';

describe('GuiaList', () => {
  const mockGuias = [
    { id: '1', codigoAwb: 'AWB123', estado: 'creada' },
    { id: '2', codigoAwb: 'AWB456', estado: 'entregada' },
  ];

  it('debe renderizar la lista de guías', () => {
    render(<GuiaList guias={mockGuias} />);
    expect(screen.getByText('AWB123')).toBeInTheDocument();
    expect(screen.getByText('AWB456')).toBeInTheDocument();
  });

  it('debe filtrar guías por estado', () => {
    render(<GuiaList guias={mockGuias} filter={{ estado: 'creada' }} />);
    expect(screen.getByText('AWB123')).toBeInTheDocument();
    expect(screen.queryByText('AWB456')).not.toBeInTheDocument();
  });

  it('debe llamar a onSelect cuando se hace clic en una guía', () => {
    const onSelect = jest.fn();
    render(<GuiaList guias={mockGuias} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('AWB123'));
    expect(onSelect).toHaveBeenCalledWith(mockGuias[0]);
  });
});

// ✅ Correcto - Prueba de API
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/guias/route';

describe('GET /api/guias', () => {
  it('debe retornar una lista de guías', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
    expect(data.meta.total).toBeDefined();
  });
});
```

---

## 12. Checklist de Calidad de Código

### 12.1. Antes de Commit

- [ ] El código pasa el linting (`pnpm lint`)
- [ ] El código está formateado (`pnpm format`)
- [ ] TypeScript compila sin errores (`pnpm tsc`)
- [ ] Todas las pruebas pasan (`pnpm test`)
- [ ] Se han añadido pruebas para nueva funcionalidad
- [ ] La documentación está actualizada
- [ ] No hay `console.log` (excepto `warn`/`error`)

### 12.2. Antes de Pull Request

- [ ] Todos los checks de CI pasan
- [ ] La cobertura de código no ha disminuido
- [ ] La funcionalidad ha sido probada manualmente
- [ ] Se han actualizado los archivos de documentación
- [ ] El PR tiene una descripción clara
- [ ] Se han añadido capturas de pantalla (si aplica)

### 12.3. Antes de Merge a Main

- [ ] El código ha sido revisado por al menos un par
- [ ] Todos los comentarios de la revisión han sido resueltos
- [ ] La versión ha sido actualizada (SemVer)
- [ ] Se ha creado una etiqueta/tag de versión
- [ ] El changelog ha sido actualizado

---

**Documento actualizado:** 25 de agosto de 2026
**Versión:** 1.0
**Referencia:** Capítulo 7 - Plan de Implementación del SGCI

---

## Referencias

- [PEP 8 - Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [SonarQube Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)

---

## Instrucciones para la Referencia Cruzada

Este documento debe ser referenciado desde los siguientes capítulos:

| Capítulo | Ubicación de la Referencia |
| :--- | :--- |
| **Capítulo 1 (Introducción)** | Sección 1.10 - Estructura del Documento |
| **Capítulo 2 (Marco Teórico)** | Sección 2.3.2 - Stack Tecnológico |
| **Capítulo 3 (Marco Legal)** | Sección 3.6.2 - Estrategias de Mitigación |
| **Capítulo 4 (Diseño del Sistema)** | Sección 4.4 - Frontend, 4.5 - Backend |
| **Capítulo 5 (Modelo de Datos)** | Sección 5.12 - Guía de Base de Datos |
| **Capítulo 6 (Metodología de Validación)** | Sección 6.4 - Instrumentos de Medición |
| **Capítulo 7 (Plan de Implementación)** | Sección 7.10 - Calidad de Código |
| **Capítulo 8 (Plan de Comercialización)** | Sección 8.7 - Plan de Alianzas Estratégicas |
| **Conclusiones** | Sección 6 - Trabajo Futuro |