
import React, { useState, useEffect } from 'react';
import { Editor } from './components/Editor';
import { type DesignElement, ElementType, Alignment, Fill, StarElement, TriangleElement, RectangleElement, EllipseElement, TextElement, SvgElement, CanvasSettings, RecentFile, DesignProject, GroupElement, ViewState, ImageElement } from './types';
import { INITIAL_ELEMENTS, BLANK_CANVAS_ELEMENTS, INITIAL_CANVAS_SETTINGS } from './constants';
import { generateLayout } from './services/geminiService';
import { exportToSvg, exportToPng, generateCanvasPreview, exportToPdf } from './utils/exportUtils';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmCloseModal } from './components/ConfirmCloseModal';
import { ImageUrlModal } from './components/ImageUrlModal';
import { UnsplashModal } from './components/UnsplashModal';
import { SvgLibraryModal } from './components/SvgLibraryModal';
import { NewFileModal } from './components/NewFileModal';


const App: React.FC = () => {
  const [openDesigns, setOpenDesigns] = useState<DesignProject[]>([]);
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupEditBackup, setGroupEditBackup] = useState<DesignElement[] | null>(null);

  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  const [isSvgLibraryModalOpen, setIsSvgLibraryModalOpen] = useState(false);
  const [confirmCloseInfo, setConfirmCloseInfo] = useState<{ designId: string } | null>(null);

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<DesignElement[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ zoom: 1, pan: { x: 0, y: 0 }, isRulersVisible: true });

  // Find active design and its properties
  const activeDesign = openDesigns.find(d => d.id === activeDesignId);
  const activeElements = activeDesign ? activeDesign.elementsHistory[activeDesign.historyIndex] : [];
  const canvasSettings = activeDesign ? activeDesign.settings : INITIAL_CANVAS_SETTINGS;
  const guides = activeDesign?.guides ?? { horizontal: [], vertical: [] };

  const editingGroup = editingGroupId ? activeElements.find(el => el.id === editingGroupId) as GroupElement : null;
  const elements = editingGroupId && editingGroup ? editingGroup.children : activeElements;

  useEffect(() => {
      const newId = uuidv4();
      setOpenDesigns([{
          id: newId,
          settings: INITIAL_CANVAS_SETTINGS,
          elementsHistory: [INITIAL_ELEMENTS],
          historyIndex: 0,
          isDirty: false,
          guides: { horizontal: [], vertical: [] },
      }]);
      setActiveDesignId(newId);
  }, []);
  
  useEffect(() => {
    setSelectedElementIds([]);
    setEditingGroupId(null);
    setViewState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
  }, [activeDesignId]);

  useEffect(() => {
    try {
        const savedFiles = localStorage.getItem('lienzoCreativoRecents');
        if (savedFiles) {
            setRecentFiles(JSON.parse(savedFiles));
        } else {
            setRecentFiles([
                { id: 'ex1', name: 'Ejemplo: Tarjeta', preview: 'https://picsum.photos/seed/ex1/200/150', settings: {...INITIAL_CANVAS_SETTINGS, name: 'Ejemplo: Tarjeta'}, elements: [], updatedAt: new Date().toISOString()},
                { id: 'ex2', name: 'Ejemplo: Post', preview: 'https://picsum.photos/seed/ex2/200/150', settings: {...INITIAL_CANVAS_SETTINGS, name: 'Ejemplo: Post'}, elements: [], updatedAt: new Date().toISOString()}
            ]);
        }
    } catch (e) { console.error("No se pudieron cargar los archivos recientes:", e); }
  }, []);

  const updateActiveDesign = (updater: (design: DesignProject) => DesignProject) => {
    setOpenDesigns(prevDesigns =>
      prevDesigns.map(design =>
        design.id === activeDesignId ? updater(design) : design
      )
    );
  };
  
  const setElementsWithHistory = (newElementsOrUpdater: DesignElement[] | ((prevElements: DesignElement[]) => DesignElement[])) => {
    if (!activeDesign) return;
    const currentElements = activeDesign.elementsHistory[activeDesign.historyIndex];
    const resolvedElements = typeof newElementsOrUpdater === 'function' ? newElementsOrUpdater(currentElements) : newElementsOrUpdater;

    updateActiveDesign(design => {
      const newHistory = [...design.elementsHistory.slice(0, design.historyIndex + 1), resolvedElements];
      return { ...design, elementsHistory: newHistory, historyIndex: newHistory.length - 1, isDirty: true };
    });
  };
  
    const updateElementsRecursively = (elements: DesignElement[], ids: string[], updates: Partial<DesignElement>): DesignElement[] => {
        return elements.map(el => {
            if (ids.includes(el.id)) {
                return { ...el, ...updates } as DesignElement;
            }
            if (el.type === ElementType.Group) {
                const updatedChildren = updateElementsRecursively((el as GroupElement).children, ids, updates);
                return { ...el, children: updatedChildren };
            }
            return el;
        });
    };
    
    const toggleElementLockRecursively = (elements: DesignElement[], id: string): DesignElement[] => {
        return elements.map(el => {
            if (el.id === id) {
                return { ...el, isLocked: !el.isLocked };
            }
            if (el.type === ElementType.Group) {
                const updatedChildren = toggleElementLockRecursively((el as GroupElement).children, id);
                return { ...el, children: updatedChildren };
            }
            return el;
        });
    };

    const updateElementNameRecursively = (elements: DesignElement[], id: string, name: string): DesignElement[] => {
        return elements.map(el => {
            if (el.id === id) {
                return { ...el, name };
            }
            if (el.type === ElementType.Group) {
                const updatedChildren = updateElementNameRecursively((el as GroupElement).children, id, name);
                return { ...el, children: updatedChildren };
            }
            return el;
        });
    };

    const handleUpdateElementName = (id: string, name: string) => {
        setElementsWithHistory(prevElements => updateElementNameRecursively(prevElements, id, name));
    };

    const findElementsRecursively = (elements: DesignElement[], ids: string[]): DesignElement[] => {
        let found: DesignElement[] = [];
        for(const el of elements) {
            if (ids.includes(el.id)) {
                found.push(el);
            }
            if (el.type === ElementType.Group) {
                found = [...found, ...findElementsRecursively((el as GroupElement).children, ids)];
            }
        }
        return found;
    }

    const deleteElementsRecursively = (elements: DesignElement[], ids: string[]): DesignElement[] => {
        return elements.reduce((acc, el) => {
            if (ids.includes(el.id)) {
                return acc;
            }
            if (el.type === ElementType.Group) {
                const updatedChildren = deleteElementsRecursively((el as GroupElement).children, ids);
                acc.push({ ...el, children: updatedChildren });
            } else {
                acc.push(el);
            }
            return acc;
        }, [] as DesignElement[]);
    };

  const handleSelectElement = (id: string | null, shiftKey: boolean) => {
    if (id === null) {
      setSelectedElementIds([]);
      return;
    }
    setSelectedElementIds(prev => {
      if (shiftKey) {
        return prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id];
      }
      return [id];
    });
  };
  
    const handleUpdateElements = (ids: string[], updates: Partial<DesignElement>) => {
        setElementsWithHistory(prevElements => updateElementsRecursively(prevElements, ids, updates));
    };


  const handleAddElement = (type: ElementType) => {
    let newElement: DesignElement;
    const base = { id: uuidv4(), x: 0, y: 0, rotation: 0, opacity: 1, isVisible: true };
    switch (type) {
      case ElementType.Text:
        newElement = { ...base, type: ElementType.Text, content: 'Texto', fontSize: 48, fill: { type: 'solid', color: '#000000' }, fontWeight: 400, fontFamily: 'Arial', width: 200, height: 50 }; break;
      case ElementType.Rectangle:
        newElement = { ...base, type: ElementType.Rectangle, fill: { type: 'solid', color: '#cccccc' }, width: 200, height: 100 }; break;
      case ElementType.Ellipse:
        newElement = { ...base, type: ElementType.Ellipse, fill: { type: 'solid', color: '#cccccc' }, width: 150, height: 150 }; break;
      case ElementType.Line:
        newElement = { ...base, type: ElementType.Line, strokeColor: '#000000', strokeWidth: 2, width: 200, height: 2 }; break;
      case ElementType.Triangle:
        newElement = { ...base, type: ElementType.Triangle, fill: { type: 'solid', color: '#cccccc' }, width: 100, height: 100 }; break;
      case ElementType.Star:
        newElement = { ...base, type: ElementType.Star, fill: { type: 'solid', color: '#cccccc' }, points: 5, innerRadius: 0.5, width: 100, height: 100 }; break;
      case ElementType.QrCode:
        newElement = { ...base, type: ElementType.QrCode, data: 'https://example.com', width: 150, height: 150 }; break;
      default: return;
    }
    const centerX = canvasSettings.width / 2;
    const centerY = canvasSettings.height / 2;
    newElement.x = centerX - newElement.width / 2;
    newElement.y = centerY - newElement.height / 2;
    setElementsWithHistory(prevElements => [...prevElements, newElement]);
  };
  
  const handleAddCompleteElement = (element: DesignElement) => {
    const newElement = {
        ...element,
        id: uuidv4(),
    };
    if (newElement.type === ElementType.Group) {
        newElement.children = newElement.children.map(child => ({...child, id: uuidv4()}));
    }
    const centerX = canvasSettings.width / 2;
    const centerY = canvasSettings.height / 2;
    newElement.x = centerX - newElement.width / 2;
    newElement.y = centerY - newElement.height / 2;
    setElementsWithHistory(prev => [...prev, newElement]);
  };

  const handleAddSvg = (svgContent: string) => {
    const newElement: SvgElement = {
      id: uuidv4(),
      type: ElementType.Svg,
      x: 50, y: 50, width: 100, height: 100, rotation: 0,
      svgContent: svgContent,
      fill: { type: 'solid', color: '#000000' }
    };
    setElementsWithHistory(prev => [...prev, newElement]);
  };

  const handleDeleteElements = (ids: string[]) => {
    setElementsWithHistory(prevElements => deleteElementsRecursively(prevElements, ids));
    setSelectedElementIds([]);
  };

  const handleDuplicateElements = (ids: string[]) => {
    const elementsToDuplicate = findElementsRecursively(activeElements, ids);
    const newElements = elementsToDuplicate.map(el => ({
        ...JSON.parse(JSON.stringify(el)), // Deep copy
        id: uuidv4(),
        x: el.x + 20,
        y: el.y + 20,
    }));
    setElementsWithHistory(prevElements => [...prevElements, ...newElements]);
    setSelectedElementIds(newElements.map(el => el.id));
  };
  
  const moveInZIndex = (ids: string[], direction: 'forward' | 'backward' | 'front' | 'back') => {
    setElementsWithHistory(currentElements => {
      const newElements = [...currentElements];
      const selected = ids.map(id => newElements.find(e => e.id === id)).filter(Boolean) as DesignElement[];
      
      selected.forEach(element => {
          const index = newElements.findIndex(e => e.id === element.id);
          if (index === -1) return;
          newElements.splice(index, 1);
      });
      
      switch(direction) {
          case 'front': newElements.push(...selected); break;
          case 'back': newElements.unshift(...selected); break;
          case 'forward': {
              const highestIndex = Math.max(...ids.map(id => currentElements.findIndex(e => e.id === id)));
              newElements.splice(Math.min(newElements.length, highestIndex + 1 - (selected.length -1)), 0, ...selected);
              break;
          }
          case 'backward': {
              const lowestIndex = Math.min(...ids.map(id => currentElements.findIndex(e => e.id === id)));
              newElements.splice(Math.max(0, lowestIndex - 1), 0, ...selected);
              break;
          }
      }
      return newElements;
    });
  };

  const handleBringForward = (ids: string[]) => moveInZIndex(ids, 'forward');
  const handleSendBackward = (ids: string[]) => moveInZIndex(ids, 'backward');
  const handleBringToFront = (ids: string[]) => moveInZIndex(ids, 'front');
  const handleSendToBack = (ids: string[]) => moveInZIndex(ids, 'back');

  const handleMoveElementLayer = (draggedId: string, dropTargetId: string) => {
    setElementsWithHistory(currentElements => {
        const draggedIndex = currentElements.findIndex(el => el.id === draggedId);
        const dropTargetIndex = currentElements.findIndex(el => el.id === dropTargetId);
        if (draggedIndex === -1 || dropTargetIndex === -1) return currentElements;
        const newElements = [...currentElements];
        const [draggedElement] = newElements.splice(draggedIndex, 1);
        const newDropIndex = currentElements.findIndex(el => el.id === dropTargetId);
        newElements.splice(newDropIndex, 0, draggedElement);
        return newElements;
    });
  };

  const handleAlignElements = (alignment: Alignment) => {
      const selected = findElementsRecursively(activeElements, selectedElementIds);
      if (selected.length < 2) return;
      const boundingBox = selected.reduce((acc, el) => ({
          minX: Math.min(acc.minX, el.x),
          minY: Math.min(acc.minY, el.y),
          maxX: Math.max(acc.maxX, el.x + el.width),
          maxY: Math.max(acc.maxY, el.y + el.height),
      }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

      let updates: Partial<DesignElement>[] = [];
      if (alignment === 'distribute-h' || alignment === 'distribute-v') {
          const sorted = [...selected].sort((a,b) => alignment === 'distribute-h' ? a.x - b.x : a.y - b.y);
          const totalSize = sorted.reduce((sum, el) => sum + (alignment === 'distribute-h' ? el.width : el.height), 0);
          const totalSpace = (alignment === 'distribute-h' ? boundingBox.maxX - boundingBox.minX : boundingBox.maxY - boundingBox.minY) - totalSize;
          const gap = totalSpace / (sorted.length - 1);
          let currentPos = alignment === 'distribute-h' ? boundingBox.minX : boundingBox.minY;
          updates = sorted.map(el => {
              const newPos = { [alignment === 'distribute-h' ? 'x' : 'y']: currentPos };
              currentPos += (alignment === 'distribute-h' ? el.width : el.height) + gap;
              return newPos;
          });
      } else {
          updates = selected.map(el => {
              switch (alignment) {
                  case 'left': return { x: boundingBox.minX };
                  case 'center-h': return { x: boundingBox.minX + (boundingBox.maxX - boundingBox.minX) / 2 - el.width / 2 };
                  case 'right': return { x: boundingBox.maxX - el.width };
                  case 'top': return { y: boundingBox.minY };
                  case 'center-v': return { y: boundingBox.minY + (boundingBox.maxY - boundingBox.minY) / 2 - el.height / 2 };
                  case 'bottom': return { y: boundingBox.maxY - el.height };
                  default: return {};
              }
          });
      }
      handleUpdateElements(selectedElementIds, updates.reduce((acc, val, i) => ({...acc, ...selected[i], ...val}), {}));
  };

  const handleGenerateLayout = async (prompt: string) => {
    setIsLoading(true); setError(null);
    try {
      const newElements = await generateLayout(prompt, canvasSettings.width, canvasSettings.height);
      setElementsWithHistory(newElements);
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };
  
    const handleToggleElementLock = (id: string) => {
        setElementsWithHistory(prev => toggleElementLockRecursively(prev, id));
    };

    const handleToggleSelectedLock = () => {
        const isLocked = selectedElementIds.length > 0 && findElementsRecursively(activeElements, selectedElementIds).every(el => el.isLocked);
        handleUpdateElements(selectedElementIds, { isLocked: !isLocked });
    };
    
    const handleGroupElements = () => {
        const selected = findElementsRecursively(activeElements, selectedElementIds);
        if (selected.length <= 1) return;

        const boundingBox = selected.reduce((acc, el) => ({
            minX: Math.min(acc.minX, el.x),
            minY: Math.min(acc.minY, el.y),
        }), { minX: Infinity, minY: Infinity });
        
        const maxX = Math.max(...selected.map(el => el.x + el.width));
        const maxY = Math.max(...selected.map(el => el.y + el.height));
        const groupWidth = maxX - boundingBox.minX;
        const groupHeight = maxY - boundingBox.minY;

        const newGroup: GroupElement = {
            id: uuidv4(),
            type: ElementType.Group,
            x: boundingBox.minX,
            y: boundingBox.minY,
            width: groupWidth,
            height: groupHeight,
            rotation: 0,
            children: selected.map(el => ({
                ...el,
                x: el.x - boundingBox.minX,
                y: el.y - boundingBox.minY,
            })),
        };

        const elementsWithoutGrouped = deleteElementsRecursively(activeElements, selectedElementIds);
        setElementsWithHistory([...elementsWithoutGrouped, newGroup]);
        setSelectedElementIds([newGroup.id]);
    };

    const handleUngroupElements = () => {
        const groupsToUngroup = findElementsRecursively(activeElements, selectedElementIds).filter(el => el.type === ElementType.Group) as GroupElement[];
        if (groupsToUngroup.length === 0) return;
        
        const newElementsFromGroups: DesignElement[] = [];
        groupsToUngroup.forEach(group => {
            newElementsFromGroups.push(...group.children.map(child => ({
                ...child,
                x: group.x + child.x,
                y: group.y + child.y,
            })));
        });

        const elementsWithoutUngrouped = deleteElementsRecursively(activeElements, groupsToUngroup.map(g => g.id));
        setElementsWithHistory([...elementsWithoutUngrouped, ...newElementsFromGroups]);
        setSelectedElementIds(newElementsFromGroups.map(el => el.id));
    };

    const handleNew = () => setIsNewFileModalOpen(true);
    
    const saveDesign = async (designToSave: DesignProject): Promise<RecentFile> => {
        const preview = await generateCanvasPreview(designToSave.elementsHistory[designToSave.historyIndex], designToSave.settings.width, designToSave.settings.height);
        const fileData: RecentFile = {
            id: designToSave.id,
            name: designToSave.settings.name,
            preview,
            settings: designToSave.settings,
            elements: designToSave.elementsHistory[designToSave.historyIndex],
            updatedAt: new Date().toISOString(),
        };
        
        setRecentFiles(prev => {
            const existingIndex = prev.findIndex(f => f.id === designToSave.id);
            let newRecents = [...prev];
            if (existingIndex > -1) { newRecents.splice(existingIndex, 1); }
            newRecents.unshift(fileData);
            if (newRecents.length > 12) newRecents = newRecents.slice(0, 12);
            localStorage.setItem('lienzoCreativoRecents', JSON.stringify(newRecents));
            return newRecents;
        });
        
        return fileData;
    };
    
    const handleSave = async () => {
        if (!activeDesign) return;
        await saveDesign(activeDesign);
        updateActiveDesign(d => ({ ...d, isDirty: false }));
        setError("Diseño guardado en 'Recientes'.");
        setTimeout(() => setError(null), 2000);
    };

    const handleSaveAs = async () => {
        if (!activeDesign) return;
        const fileData = await saveDesign(activeDesign);
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fileData))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `${activeDesign.settings.name}.json`;
        link.click();
        updateActiveDesign(d => ({ ...d, isDirty: false }));
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedFile = JSON.parse(event.target?.result as string) as RecentFile;
                handleCreateNewDesign(loadedFile.settings, loadedFile.elements);
            } catch (err) {
                setError("No se pudo cargar el archivo. Formato inválido.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const newImage: ImageElement = {
                        id: uuidv4(),
                        type: ElementType.Image,
                        x: (canvasSettings.width - img.width) / 2,
                        y: (canvasSettings.height - img.height) / 2,
                        width: img.width,
                        height: img.height,
                        rotation: 0,
                        src: reader.result as string,
                    };
                    setElementsWithHistory(prev => [...prev, newImage]);
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleAddImageFromUrl = (url: string) => {
         const newImage: ImageElement = {
            id: uuidv4(), type: ElementType.Image,
            x: 50, y: 50, width: 300, height: 200, rotation: 0,
            src: url,
        };
        const centerX = canvasSettings.width / 2;
        const centerY = canvasSettings.height / 2;
        newImage.x = centerX - newImage.width / 2;
        newImage.y = centerY - newImage.height / 2;
        setElementsWithHistory(prev => [...prev, newImage]);
    };

    const handleExportPng = () => {
        if (!activeDesign) return;
        exportToPng(activeElements, canvasSettings.width, canvasSettings.height, `${canvasSettings.name}.png`);
    };
    const handleExportSvg = () => {
        if (!activeDesign) return;
        const svgString = exportToSvg(activeElements, canvasSettings.width, canvasSettings.height);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${canvasSettings.name}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPdf = async () => {
        if (!activeDesign) return;
        setIsLoading(true);
        setError("Exportando PDF...");
        try {
            await exportToPdf(activeElements, canvasSettings.width, canvasSettings.height, `${canvasSettings.name}.pdf`);
            setError(null);
        } catch (e: any) {
            setError(`Error al exportar PDF: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrint = () => window.print();

    const handleUndo = () => updateActiveDesign(d => ({ ...d, historyIndex: Math.max(0, d.historyIndex - 1) }));
    const handleRedo = () => updateActiveDesign(d => ({ ...d, historyIndex: Math.min(d.elementsHistory.length - 1, d.historyIndex + 1) }));

    const handleCut = () => { setClipboard(findElementsRecursively(activeElements, selectedElementIds)); handleDeleteElements(selectedElementIds); };
    const handleCopy = () => { setClipboard(findElementsRecursively(activeElements, selectedElementIds)); };
    const handlePaste = () => {
        if (clipboard.length === 0) return;
        const newElements = clipboard.map(el => ({
            ...JSON.parse(JSON.stringify(el)),
            id: uuidv4(),
            x: el.x + 20,
            y: el.y + 20,
        }));
        setElementsWithHistory(prev => [...prev, ...newElements]);
        setSelectedElementIds(newElements.map(el => el.id));
    };
    
    const handleSelectAll = () => setSelectedElementIds(elements.map(el => el.id));
    
    const handleCreateNewDesign = (settings: CanvasSettings, startElements?: DesignElement[]) => {
        const newId = uuidv4();
        const newDesign: DesignProject = {
            id: newId,
            settings,
            elementsHistory: [startElements || BLANK_CANVAS_ELEMENTS],
            historyIndex: 0,
            isDirty: !!startElements,
            guides: { horizontal: [], vertical: [] },
        };
        setOpenDesigns(prev => [...prev, newDesign]);
        setActiveDesignId(newId);
        setIsNewFileModalOpen(false);
    };

    const handleLoadFromRecent = (file: RecentFile) => {
        const existing = openDesigns.find(d => d.id === file.id);
        if (existing) {
            setActiveDesignId(file.id);
        } else {
             const newDesign: DesignProject = {
                id: file.id,
                settings: file.settings,
                elementsHistory: [file.elements],
                historyIndex: 0,
                isDirty: false,
                guides: { horizontal: [], vertical: [] },
            };
            setOpenDesigns(prev => [...prev, newDesign]);
            setActiveDesignId(file.id);
        }
        setIsNewFileModalOpen(false);
    };
    
    const handleSwitchDesign = (id: string) => setActiveDesignId(id);

    const handleCloseDesign = (id: string) => {
        const designToClose = openDesigns.find(d => d.id === id);
        if (designToClose?.isDirty) {
            setConfirmCloseInfo({ designId: id });
            return;
        }
        
        closeDesignTab(id);
    };
    
    const closeDesignTab = (id: string) => {
        const designIndex = openDesigns.findIndex(d => d.id === id);
        if (designIndex === -1) return;
        
        let newActiveId = activeDesignId;
        if (activeDesignId === id) {
             if (openDesigns.length > 1) {
                newActiveId = designIndex > 0 ? openDesigns[designIndex - 1].id : openDesigns[1].id;
            } else {
                newActiveId = null;
            }
        }
        
        setOpenDesigns(prev => prev.filter(d => d.id !== id));
        setActiveDesignId(newActiveId);
        
        if (openDesigns.length === 1 && newActiveId === null) {
            const newId = uuidv4();
            setOpenDesigns([{
              id: newId,
              settings: INITIAL_CANVAS_SETTINGS,
              elementsHistory: [INITIAL_ELEMENTS],
              historyIndex: 0,
              isDirty: false,
              guides: { horizontal: [], vertical: [] },
            }]);
            setActiveDesignId(newId);
        }
    }
    
    const handleConfirmCloseSave = async () => {
        if (!confirmCloseInfo) return;
        const designToSave = openDesigns.find(d => d.id === confirmCloseInfo.designId);
        if (designToSave) {
            await saveDesign(designToSave);
        }
        closeDesignTab(confirmCloseInfo.designId);
        setConfirmCloseInfo(null);
    };
    
    const handleConfirmCloseDiscard = () => {
        if (confirmCloseInfo) {
            closeDesignTab(confirmCloseInfo.designId);
            setConfirmCloseInfo(null);
        }
    };
    
    const handleSetEditingGroupId = (id: string | null) => {
        if (id) {
            setGroupEditBackup(JSON.parse(JSON.stringify(activeElements)));
            setSelectedElementIds([]); // Clear selection when entering group edit
        } else {
            setGroupEditBackup(null);
        }
        setEditingGroupId(id);
    };

    const handleAcceptGroupChanges = () => {
        setEditingGroupId(null);
        setGroupEditBackup(null);
    };

    const handleDiscardGroupChanges = () => {
        if (groupEditBackup) {
            setElementsWithHistory(groupEditBackup);
        }
        setEditingGroupId(null);
        setGroupEditBackup(null);
    };
    
    const handleAddGuide = (axis: 'horizontal' | 'vertical', position: number) => {
        updateActiveDesign(design => {
            const newGuides = { ...design.guides };
            if (axis === 'horizontal') newGuides.horizontal = [...(newGuides.horizontal || []), position];
            else newGuides.vertical = [...(newGuides.vertical || []), position];
            return { ...design, guides: newGuides, isDirty: true };
        });
    };

    const handleUpdateGuide = (axis: 'horizontal' | 'vertical', index: number, position: number) => {
        updateActiveDesign(design => {
            const newGuides = { ...design.guides };
            if (axis === 'horizontal' && newGuides.horizontal) {
                const updated = [...newGuides.horizontal];
                updated[index] = position;
                newGuides.horizontal = updated;
            } else if (axis === 'vertical' && newGuides.vertical) {
                const updated = [...newGuides.vertical];
                updated[index] = position;
                newGuides.vertical = updated;
            }
            return { ...design, guides: newGuides, isDirty: true };
        });
    };
    
    const handleDeleteGuide = (axis: 'horizontal' | 'vertical', index: number) => {
        updateActiveDesign(design => {
            const newGuides = { ...design.guides };
            if (axis === 'horizontal' && newGuides.horizontal) {
                newGuides.horizontal = newGuides.horizontal.filter((_, i) => i !== index);
            } else if (axis === 'vertical' && newGuides.vertical) {
                newGuides.vertical = newGuides.vertical.filter((_, i) => i !== index);
            }
            return { ...design, guides: newGuides, isDirty: true };
        });
    };

    const handleToggleRulers = () => {
        setViewState(prev => ({...prev, isRulersVisible: !(prev.isRulersVisible ?? true) }));
    };

    const selectedElements = findElementsRecursively(activeElements, selectedElementIds);

  return (
    <>
      {/* FIX: Removed duplicate NewFileModal rendering. The Editor component now handles it. */}
      {confirmCloseInfo && <ConfirmCloseModal onClose={() => setConfirmCloseInfo(null)} onSave={handleConfirmCloseSave} onDiscard={handleConfirmCloseDiscard} />}
      {isImageUrlModalOpen && <ImageUrlModal onClose={() => setIsImageUrlModalOpen(false)} onAddImage={handleAddImageFromUrl} />}
      {isUnsplashModalOpen && <UnsplashModal onClose={() => setIsUnsplashModalOpen(false)} onSelectImage={handleAddImageFromUrl} />}
      {isSvgLibraryModalOpen && <SvgLibraryModal onClose={() => setIsSvgLibraryModalOpen(false)} onAddSvg={handleAddSvg} />}
      {activeDesign && (
        <Editor
            elements={elements}
            activeElements={activeElements}
            canvasSettings={canvasSettings}
            guides={guides}
            onAddGuide={handleAddGuide}
            onUpdateGuide={handleUpdateGuide}
            onDeleteGuide={handleDeleteGuide}
            selectedElementIds={selectedElementIds}
            selectedElements={selectedElements}
            editingGroupId={editingGroupId}
            onSetEditingGroupId={handleSetEditingGroupId}
            onAcceptGroupChanges={handleAcceptGroupChanges}
            onDiscardGroupChanges={handleDiscardGroupChanges}
            onSelectElement={handleSelectElement}
            onUpdateElements={handleUpdateElements}
            onUpdateElementName={handleUpdateElementName}
            onAddElement={handleAddElement}
            onAddCompleteElement={handleAddCompleteElement}
            onDeleteElements={handleDeleteElements}
            onDuplicateElements={handleDuplicateElements}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onMoveElement={handleMoveElementLayer}
            onAlignElements={handleAlignElements}
            onGenerateLayout={handleGenerateLayout}
            onSetElements={(els, settings) => {
                setElementsWithHistory(els);
                if (settings) {
                    updateActiveDesign(d => ({ ...d, settings }));
                }
            }}
            onToggleElementLock={handleToggleElementLock}
            onToggleSelectedLock={handleToggleSelectedLock}
            onGroupElements={handleGroupElements}
            onUngroupElements={handleUngroupElements}
            isLoading={isLoading}
            error={error}
            clearError={() => setError(null)}
            setError={setError}
            viewState={viewState}
            onSetViewState={setViewState}
            // Menu Actions
            onNew={handleNew}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            onLoad={handleLoad}
            onImport={handleImportImage}
            onOpenImageUrlModal={() => setIsImageUrlModalOpen(true)}
            onOpenUnsplashModal={() => setIsUnsplashModalOpen(true)}
            onOpenSvgLibraryModal={() => setIsSvgLibraryModalOpen(true)}
            onExportSvg={handleExportSvg}
            onExportPng={handleExportPng}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={activeDesign.historyIndex > 0}
            canRedo={activeDesign.historyIndex < activeDesign.elementsHistory.length - 1}
            onCut={handleCut}
            onCopy={handleCopy}
            onPaste={handlePaste}
            canPaste={clipboard.length > 0}
            onSelectAll={handleSelectAll}
            onToggleRulers={handleToggleRulers}
            // New File Modal
            isNewFileModalOpen={isNewFileModalOpen}
            onCloseNewFileModal={() => setIsNewFileModalOpen(false)}
            onCreateNewDesign={handleCreateNewDesign}
            // FIX: Pass recentFiles and onLoadFromRecent to Editor
            recentFiles={recentFiles}
            onLoadFromRecent={handleLoadFromRecent}
            // Tabs
            openDesigns={openDesigns}
            activeDesignId={activeDesignId}
            onSwitchDesign={handleSwitchDesign}
            onCloseDesign={handleCloseDesign}
        />
      )}
    </>
  );
};

export default App;
