# Модели конфигуратора

Сюда кладутся оцифрованные модели G63 в формате GLB со сжатием Draco.
Ожидаемые файлы — имена заданы в `src/components/configurator/models.ts`:

| Файл | Что внутри |
|---|---|
| `stock-body.glb` | стоковый кузов |
| `body-kit-wheels.glb` | обвес M-Monogram и колёса |
| `custom-interior.glb` | интерьер |
| `steering-wheel.glb` | руль |

Пока файлов нет, конфигуратор работает на процедурной заглушке
(`GClassModel.tsx`) — сцена не ломается.

Исходные FBX конвертируются так:

```
npm install fbx2gltf
./node_modules/fbx2gltf/bin/Darwin/FBX2glTF -i "исходник.fbx" -o "models/имя" -b -d
```

Структуру готового GLB — меши, полигоны, материалы, габариты — показывает
`node scripts/inspect-glb.mjs public/models/*.glb`.
