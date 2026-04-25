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
  INITIAL_PRODUCERS 
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
  const [foilLabel, setFoilLabel] = useState(editingItem?.foilLabel || '');
  const [size, setSize] = useState(editingItem?.size || '');
  const [color, setColor] = useState(editingItem?.color || (editingItem?.category === "Bubbles" ? "Прозорий" : ""));

  // Reset category defaults
  useEffect(() => {
    if (category === "Bubbles") {
      setColor("Прозорий");
    }
  }, [category]);
  const [producer, setProducer] = useState(editingItem?.producer || '');
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
    }
  }, [category, foilType, foilLabel, subCategory, latexSeries, size, color, producer]);

  // Suggestions
  const suggestions = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>(category === "Bubbles" ? ["18\"", "20\"", "24\"", "36\""] : []);
    const series = new Set<string>(LATEX_SERIES);
    const producers = new Set<string>(INITIAL_PRODUCERS);

    products.forEach(p => {
      if (p.color) colors.add(p.color);
      if (p.size) sizes.add(p.size);
      if (p.latexSeries) series.add(p.latexSeries);
      if (p.producer) producers.add(p.producer);
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      series: Array.from(series).sort(),
      producers: Array.from(producers).sort()
    };
  }, [products]);

  const isFoil = category === "Фольговані кулі";
  const isLatex = category === "Латексні кулі";
  const isBubbles = category === "Bubbles";
  const isAutoNamed = isFoil || isLatex || isBubbles;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 lg:gap-y-4">
      {/* Live Preview */}
      <div className="col-span-full bg-primary/5 p-3 lg:p-4 rounded-2xl border border-primary/20 mb-1 sm:mb-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5 lg:mb-1">Прев'ю назви</label>
        <div className="text-base lg:text-lg font-black text-text-main leading-tight">
          {name || <span className="text-text-muted italic text-sm lg:text-base font-normal">Заповніть поля...</span>}
        </div>
        <input type="hidden" name="name" value={name} />
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Категорія</label>
        <select 
          name="category" 
          value={category} 
          required 
          className="input-field"
          onChange={(e) => {
            const newCat = e.target.value as ParentCategory;
            setCategory(newCat);
            setSubCategory(newCat === "Латексні кулі" ? LATEX_TYPES[0] : '');
            setLatexSeries('');
          }}
        >
          {PRODUCT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

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

      {!isAutoNamed && (
        <>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Назва (вручну)</label>
            <input 
              name="name" 
              defaultValue={editingItem?.name} 
              onChange={(e) => setName(e.target.value)}
              required 
              maxLength={200} 
              className="input-field" 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Підкатегорія</label>
            <select 
              name="subCategory" 
              value={subCategory} 
              className="input-field"
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value="">Без підкатегорії</option>
              {SUB_CATEGORIES[category]?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </>
      )}

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

      {!isBubbles && (
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Колір</label>
          <input 
            list="colors" 
            name="color" 
            value={color} 
            required={!isBubbles} 
            className="input-field" 
            onChange={(e) => setColor(e.target.value)}
          />
          <datalist id="colors">
            {suggestions.colors.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
      )}

      {isBubbles && (
        <div className="col-span-full">
          <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Примітка</label>
          <textarea 
            name="description" 
            defaultValue={editingItem?.description} 
            placeholder="Введіть особливості, наприклад: з наповнювачем, тощо" 
            className="input-field min-h-[80px]" 
          />
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Виробник</label>
        <input 
          list="producers" 
          name="producer" 
          value={producer} 
          required 
          className="input-field" 
          onChange={(e) => setProducer(e.target.value)}
        />
        <datalist id="producers">
          {suggestions.producers.map(p => <option key={p} value={p} />)}
        </datalist>
      </div>

      <div className="col-span-full">
        <label className="text-sm font-bold text-text-muted block mb-1.5 lg:mb-2">Посилання на фото (URL)</label>
        <input name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="input-field" />
      </div>
    </div>
  );
};
