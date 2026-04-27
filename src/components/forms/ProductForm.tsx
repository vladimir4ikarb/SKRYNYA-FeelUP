import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import { 
  PRODUCT_CATEGORIES, 
  ParentCategory, 
  SUB_CATEGORIES, 
  FOIL_TYPES, 
  FoilType, 
  FOIL_SHAPES,
  LATEX_TYPES,
  LATEX_SERIES,
  INITIAL_PRODUCERS,
  RIBBON_TYPES,
  RIBBON_SERIES,
  RibbonType,
  HELIUM_TYPES
} from '../../constants/productCategories';

interface ProductFormProps {
  editingItem: Product | null;
  products: Product[];
}

export const ProductForm = ({ editingItem, products }: ProductFormProps) => {
  const [category, setCategory] = useState<ParentCategory>(
    (editingItem?.category as ParentCategory) || PRODUCT_CATEGORIES[0]
  );
  const [subCategory, setSubCategory] = useState(editingItem?.subCategory || '');
  const [foilType, setFoilType] = useState<FoilType>(editingItem?.foilType || FOIL_TYPES[0]);
  const [latexSeries, setLatexSeries] = useState(editingItem?.latexSeries || '');
  const [ribbonSeries, setRibbonSeries] = useState(editingItem?.ribbonSeries || '');
  const [ribbonWidth, setRibbonWidth] = useState(editingItem?.ribbonWidth || '');
  const [ribbonLength, setRibbonLength] = useState(editingItem?.ribbonLength || '');
  const [decorShape, setDecorShape] = useState(editingItem?.decorShape || '');
  const [decorWeight, setDecorWeight] = useState(editingItem?.decorWeight || '');
  const [decorVolume, setDecorVolume] = useState(editingItem?.decorVolume || '');
  const [equipmentModel, setEquipmentModel] = useState(editingItem?.equipmentModel || '');
  const [heliumTankNumber, setHeliumTankNumber] = useState(editingItem?.heliumTankNumber || '');
  const [note, setNote] = useState(editingItem?.note || '');
  const [costPrice, setCostPrice] = useState(editingItem?.costPrice || 0);
  const [foilLabel, setFoilLabel] = useState(editingItem?.foilLabel || '');
  const [size, setSize] = useState(editingItem?.size || '');
  const [color, setColor] = useState(editingItem?.color || (editingItem?.category === "Bubbles" ? "Прозорий" : ""));

  // Reset category defaults
  useEffect(() => {
    if (category === "Bubbles") {
      setColor("Прозорий");
    }
  }, [category]);
  const [description, setDescription] = useState(editingItem?.description || '');
  const [producer, setProducer] = useState(editingItem?.producer || '');
  const [baseName, setBaseName] = useState(() => {
    if ((category === "Обладнання") && editingItem?.name && editingItem?.note) {
      if (editingItem.name.endsWith(editingItem.note)) {
        return editingItem.name.slice(0, -(editingItem.note.length)).trim();
      }
    }
    return editingItem?.name || '';
  });
  const [name, setName] = useState(editingItem?.name || '');

  // Live Name Generation
  useEffect(() => {
    if (category === "Фольговані кулі") {
      const parts = [
        "Фольга",
        foilType,
        foilLabel,
        size ? (size.includes('"') ? size : `${size}"`) : '',
        color,
        producer
      ].filter(Boolean);
      setName(parts.join(' '));
    } else if (category === "Латексні кулі") {
      const isShdm = subCategory.includes('ШДМ');
      const isDefaultType = subCategory === "Круглі без малюнка";
      
      const typeLabel = isDefaultType ? "" : 
                       subCategory === "ШДМ / Моделювання" ? "ШДМ" :
                       subCategory === "Серце" ? "Серце" :
                       subCategory === "Лінколун" ? "Лінколун" :
                       subCategory === "З малюнком" ? "З малюнком" : subCategory;

      const sizeLabel = size ? (isShdm ? size : (size.includes('"') ? size : `${size}"`)) : '';

      const parts = [
        "Латекс",
        typeLabel,
        sizeLabel,
        latexSeries,
        color,
        producer
      ].filter(Boolean);
      setName(parts.join(' '));
    } else if (category === "Bubbles") {
      const parts = [
        "Баблс",
        size ? (size.includes('"') ? size : `${size}"`) : '',
        producer
      ].filter(Boolean);
      setName(parts.join(' '));
    } else if (category === "Стрічки") {
      const type = subCategory as RibbonType;
      let parts: string[] = ["Стрічка", type];
      
      if (type === "Поліпропіленова") {
        parts = [...parts, ribbonSeries, color, ribbonLength ? `${ribbonLength} м` : ''].filter(Boolean);
      } else if (type === "Атласна" || type === "Органза") {
        parts = [...parts, color, ribbonWidth ? `${ribbonWidth} мм` : '', ribbonLength ? `${ribbonLength} м` : ''].filter(Boolean);
      } else {
        // Fallback for custom name if no known type
        parts = [name];
      }
      setName(parts.join(' '));
    } else if (category === "Декор / Наповнювачі") {
      let parts: string[] = [];
      if (subCategory === "Конфеті") {
        parts = ["Конфеті", decorShape, color, decorWeight ? `${decorWeight} г` : ''].filter(Boolean);
      } else if (subCategory === "Пірʼя") {
        parts = ["Пірʼя", color, decorWeight ? `${decorWeight} г` : ''].filter(Boolean);
      } else if (subCategory === "Пінопластові кульки") {
        parts = ["Пінопластові кульки", color, decorVolume ? `${decorVolume} мл` : ''].filter(Boolean);
      } else if (subCategory === "Інше") {
        // For "Інше", we use the manually entered name
        return; 
      }
      if (parts.length > 0) setName(parts.join(' '));
    } else if (category === "Розхідники") {
      setName(baseName);
    } else if (category === "Обладнання") {
      const parts = [baseName, note].filter(Boolean);
      setName(parts.join(' '));
    } else if (category === "Гелій") {
      const parts = ["Гелій", subCategory].filter(Boolean);
      setName(parts.join(' '));
    }
  }, [category, foilType, foilLabel, subCategory, latexSeries, ribbonSeries, ribbonWidth, ribbonLength, decorShape, decorWeight, decorVolume, size, color, producer, baseName, note]);

  // Suggestions
  const suggestions = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>(category === "Bubbles" ? ["18\"", "20\"", "24\"", "36\""] : []);
    const series = new Set<string>(LATEX_SERIES);
    const ribbonSeriesSet = new Set<string>(RIBBON_SERIES);
    const producers = new Set<string>(INITIAL_PRODUCERS);
    const consumableNames = new Set<string>(); // Only from existing products
    const equipmentNames = new Set<string>(); // Only from existing products
    const equipmentModels = new Set<string>();
    const heliumTanks = new Set<string>();

    products.forEach(p => {
      if (p.color) colors.add(p.color);
      if (p.size) sizes.add(p.size);
      if (p.latexSeries) series.add(p.latexSeries);
      if (p.ribbonSeries) ribbonSeriesSet.add(p.ribbonSeries);
      if (p.producer) producers.add(p.producer);
      if (p.category === "Розхідники" && p.name) consumableNames.add(p.name);
      if (p.category === "Обладнання" && p.name) equipmentNames.add(p.name);
      if (p.category === "Обладнання" && p.equipmentModel) equipmentModels.add(p.equipmentModel);
      if (p.category === "Гелій" && p.heliumTankNumber) heliumTanks.add(p.heliumTankNumber);
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      series: Array.from(series).sort(),
      ribbonSeries: Array.from(ribbonSeriesSet).sort(),
      producers: Array.from(producers).sort(),
      consumableNames: Array.from(consumableNames).sort(),
      equipmentNames: Array.from(equipmentNames).sort(),
      equipmentModels: Array.from(equipmentModels).sort(),
      heliumTanks: Array.from(heliumTanks).sort()
    };
  }, [products, category]);

  const isFoil = category === "Фольговані кулі";
  const isLatex = category === "Латексні кулі";
  const isBubbles = category === "Bubbles";
  const isRibbon = category === "Стрічки";
  const isDecor = category === "Декор / Наповнювачі";
  const isConsumables = category === "Розхідники";
  const isEquipment = category === "Обладнання";
  const isHelium = category === "Гелій";
  const isAutoNamed = isFoil || isLatex || isBubbles || isRibbon || (isDecor && subCategory !== "Інше") || isConsumables || isEquipment || isHelium;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 lg:gap-y-4 items-start">
      {/* Live Preview */}
      <div className="col-span-full bg-primary/5 p-3 lg:p-4 rounded-2xl border border-primary/20 mb-1 sm:mb-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5 lg:mb-1">Прев'ю назви</label>
        <div className="text-base lg:text-lg font-black text-text-main leading-tight">
          {name || <span className="text-text-muted italic text-sm lg:text-base font-normal">Заповніть поля...</span>}
        </div>
        <input type="hidden" name="name" value={name} />
      </div>

      <div>
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Категорія</label>
        <select 
          name="category" 
          value={category} 
          required 
          className="input-field"
          onChange={(e) => {
            const newCat = e.target.value as ParentCategory;
            setCategory(newCat);
            setSubCategory(newCat === "Латексні кулі" ? LATEX_TYPES[0] : newCat === "Стрічки" ? RIBBON_TYPES[0] : newCat === "Декор / Наповнювачі" ? SUB_CATEGORIES["Декор / Наповнювачі"][0] : '');
            setLatexSeries('');
            setRibbonSeries('');
            setRibbonWidth('');
            setRibbonLength('');
            setDecorShape('');
            setDecorWeight('');
            setDecorVolume('');
          }}
        >
          {PRODUCT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isConsumables && (
        <>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2 text-primary">Назва (обов’язкове)</label>
            <input 
              name="baseName" 
              value={baseName} 
              required 
              className="input-field border-primary/50 focus:border-primary"
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Введіть назву..."
              list="consumableNames"
            />
            <datalist id="consumableNames">
              {suggestions.consumableNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Примітка</label>
            <input 
              name="note" 
              value={note} 
              className="input-field"
              onChange={(e) => setNote(e.target.value)}
              placeholder="н-клад: 50 шт / 100 мл"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2 text-primary">Собівартість</label>
            <input 
              type="number"
              name="costPrice" 
              step="0.01"
              value={costPrice} 
              className="input-field border-primary/50 focus:border-primary"
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </>
      )}

      {isEquipment && (
        <>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2 text-primary">Назва (обов’язкове)</label>
            <input 
              name="baseName" 
              value={baseName} 
              required 
              className="input-field border-primary/50 focus:border-primary"
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="н-клад: Компресор"
              list="equipmentNames"
            />
            <datalist id="equipmentNames">
              {suggestions.equipmentNames.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Примітка</label>
            <input 
              name="note" 
              value={note} 
              className="input-field"
              onChange={(e) => setNote(e.target.value)}
              placeholder="н-клад: Z-32"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2 text-primary">Собівартість</label>
            <input 
              type="number"
              name="costPrice" 
              step="0.01"
              value={costPrice} 
              className="input-field border-primary/50 focus:border-primary"
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </>
      )}

      {isHelium && (
        <>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Тип балона</label>
            <select 
              value={subCategory.endsWith(' л') && !HELIUM_TYPES.includes(subCategory as any) ? "Інше" : (HELIUM_TYPES.includes(subCategory as any) ? subCategory : "40 л")} 
              required 
              className="input-field"
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "Інше") setSubCategory(val);
                else setSubCategory("Інше");
              }}
            >
              <option value="" disabled>Оберіть тип</option>
              {HELIUM_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="hidden" name="subCategory" value={subCategory === "Інше" ? "" : subCategory} />
          </div>
          {subCategory === "Інше" && (
            <div>
              <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2 text-primary">Об'єм вручну (л)</label>
              <input 
                name="helium_manual_vol" 
                className="input-field border-primary/50 focus:border-primary"
                onChange={(e) => setSubCategory(`${e.target.value} л`)}
                placeholder="н-клад: 40 л"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Номер балона</label>
            <input 
              list="heliumTanks"
              name="heliumTankNumber" 
              value={heliumTankNumber} 
              className="input-field"
              onChange={(e) => setHeliumTankNumber(e.target.value)}
              placeholder="н-клад: #12345"
            />
            <datalist id="heliumTanks">
              {suggestions.heliumTanks.map(n => <option key={n} value={n} />)}
            </datalist>
          </div>
        </>
      )}


      {(isFoil || isLatex) && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">
            {isFoil ? 'Тип фольги' : 'Тип латексу'}
          </label>
          <select 
            name={isFoil ? "foilType" : "subCategory"} 
            value={isFoil ? foilType : subCategory} 
            required 
            className="input-field"
            onChange={(e) => isFoil ? setFoilType(e.target.value as FoilType) : setSubCategory(e.target.value)}
          >
            <option value="">Оберіть тип</option>
            {(isFoil ? FOIL_TYPES : SUB_CATEGORIES["Латексні кулі"]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {isFoil && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">
            {foilType === 'Цифра' ? 'Номер цифри' : 
             foilType === 'Фігура' ? 'Форма' : 
             foilType === 'Персонаж' ? 'Назва персонажа' : 
             foilType === 'Напис' ? 'Текст напису' : 'Назва форми'}
          </label>
          {foilType === 'Фігура' ? (
            <select 
              name="foilLabel" 
              value={foilLabel} 
              required 
              className="input-field"
              onChange={(e) => setFoilLabel(e.target.value)}
            >
              <option value="">Оберіть форму</option>
              {FOIL_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input 
              name="foilLabel" 
              value={foilLabel} 
              className="input-field" 
              onChange={(e) => setFoilLabel(e.target.value)}
              placeholder={foilType === 'Цифра' ? 'н-клад: 5' : 'Введіть значення...'}
            />
          )}
        </div>
      )}

      {isRibbon && (
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Тип стрічки</label>
          <select 
            name="subCategory" 
            value={subCategory} 
            required 
            className="input-field"
            onChange={(e) => {
              setSubCategory(e.target.value);
              setRibbonSeries('');
              setRibbonWidth('');
              setRibbonLength('');
            }}
          >
            {RIBBON_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {isRibbon && subCategory === "Поліпропіленова" && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Серія</label>
          <input 
            list="ribbonSeriesList"
            name="ribbonSeries" 
            value={ribbonSeries} 
            required 
            className="input-field"
            onChange={(e) => setRibbonSeries(e.target.value)}
            placeholder="н-клад: Пастель"
          />
          <datalist id="ribbonSeriesList">
            {suggestions.ribbonSeries.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      )}

      {isRibbon && (subCategory === "Атласна" || subCategory === "Органза") && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Ширина (мм)</label>
          <input 
            name="ribbonWidth" 
            value={ribbonWidth} 
            className="input-field"
            onChange={(e) => setRibbonWidth(e.target.value)}
            placeholder="н-клад: 25"
          />
        </div>
      )}

      {isRibbon && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Довжина (м)</label>
          <input 
            name="ribbonLength" 
            value={ribbonLength} 
            className="input-field"
            onChange={(e) => setRibbonLength(e.target.value)}
            placeholder="н-клад: 33"
          />
        </div>
      )}

      {isDecor && (
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Тип декору</label>
          <select 
            name="subCategory" 
            value={subCategory} 
            required 
            className="input-field"
            onChange={(e) => {
              setSubCategory(e.target.value);
              if (e.target.value === 'Інше') setName('');
              setDecorShape('');
              setDecorWeight('');
              setDecorVolume('');
            }}
          >
            {SUB_CATEGORIES["Декор / Наповнювачі"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {isDecor && subCategory === "Конфеті" && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Форма</label>
          <select 
            name="decorShape" 
            value={decorShape} 
            required 
            className="input-field"
            onChange={(e) => setDecorShape(e.target.value)}
          >
            <option value="">Оберіть форму</option>
            {["Коло", "Зірки", "Квадрати", "Інше"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {isDecor && (subCategory === "Конфеті" || subCategory === "Пірʼя") && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">
            Вага упаковки (г) (необов'язково)
          </label>
          <input 
            name="decorWeight" 
            value={decorWeight} 
            className="input-field"
            onChange={(e) => setDecorWeight(e.target.value)}
            placeholder="н-клад: 50"
          />
        </div>
      )}

      {isDecor && (subCategory === "Пінопластові кульки" || subCategory === "Інше") && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">
            Обʼєм упаковки (мл) (необов'язково)
          </label>
          <input 
            name="decorVolume" 
            value={decorVolume} 
            className="input-field"
            onChange={(e) => setDecorVolume(e.target.value)}
            placeholder="н-клад: 1000"
          />
        </div>
      )}

      {isDecor && subCategory === "Інше" && (
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Назва декору (обов’язкове)</label>
          <input 
            name="name" 
            value={name} 
            required 
            className="input-field"
            onChange={(e) => setName(e.target.value)}
            placeholder="Введіть назву..."
          />
        </div>
      )}



      {isLatex && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Серія</label>
          <input 
            list="series"
            name="latexSeries" 
            value={latexSeries} 
            required 
            className="input-field"
            onChange={(e) => setLatexSeries(e.target.value)}
          />
          <datalist id="series">
            {suggestions.series.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      )}

      {category !== "Стрічки" && category !== "Декор / Наповнювачі" && category !== "Обладнання" && category !== "Гелій" && category !== "Розхідники" && (
        <div>
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Розмір</label>
          <input 
            list="sizes" 
            name="size" 
            value={size} 
            required 
            className="input-field" 
            onChange={(e) => setSize(e.target.value)}
            placeholder={isLatex && subCategory.includes('ШДМ') ? 'н-клад: 260' : 'н-клад: 12"'}
          />
          <datalist id="sizes">
            {suggestions.sizes.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      )}

      {!isBubbles && !isEquipment && !isHelium && !isConsumables && (
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Колір</label>
          <input 
            list="colors" 
            name="color" 
            value={color} 
            required 
            className="input-field" 
            onChange={(e) => setColor(e.target.value)}
          />
          <datalist id="colors">
            {suggestions.colors.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Виробник</label>
        <input 
          list="producers" 
          name="producer" 
          value={producer} 
          required={!isConsumables && !isEquipment && !isHelium} 
          className="input-field" 
          onChange={(e) => setProducer(e.target.value)}
        />
        <datalist id="producers">
          {suggestions.producers.map(p => <option key={p} value={p} />)}
        </datalist>
      </div>

      {(isBubbles || isRibbon || isDecor || isConsumables || isEquipment || isHelium) && (
        <div className="col-span-full">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">
            {isRibbon || isDecor || isConsumables || isEquipment || isHelium ? 'Коментар' : 'Примітка'}
          </label>
          <textarea 
            name="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isRibbon || isDecor || isConsumables || isEquipment || isHelium ? "Додайте коментар до товару" : "Введіть особливості, наприклад: з наповнювачем, тощо"} 
            className="input-field min-h-[80px]" 
          />
        </div>
      )}

      <div className="col-span-full">
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Посилання на фото (URL)</label>
        <input name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="input-field" />
      </div>
    </div>
  );
};
