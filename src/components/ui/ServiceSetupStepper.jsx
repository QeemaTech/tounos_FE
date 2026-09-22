import CatalogHierarchyGuide from './CatalogHierarchyGuide';

export default function ServiceSetupStepper({ activeStep, currentPage = '' }) {
  let page = currentPage;
  if (!page && activeStep) {
    if (activeStep === 1) page = 'categories';
    else if (activeStep === 2) page = 'services';
    else if (activeStep === 3 || activeStep === 4) page = 'classes';
  }
  return <CatalogHierarchyGuide currentPage={page} />;
}
