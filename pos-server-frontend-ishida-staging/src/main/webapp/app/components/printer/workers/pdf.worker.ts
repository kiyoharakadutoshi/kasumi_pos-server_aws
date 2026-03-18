import { expose } from 'comlink';
import './workerShim';
let log = console.info;

const renderPDFInWorker = async (props: any) => {
  try {
    const { renderPDF } = await import('../render-pdf');
    return URL.createObjectURL(await renderPDF(props));
  } catch (error) {
    log(error);
    throw error;
  }
};

const onProgress = (cb: typeof console.info) => (log = cb);

expose({ renderPDFInWorker: renderPDFInWorker, onProgress });

export type WorkerType = {
  renderPDFInWorker: typeof renderPDFInWorker;
  onProgress: typeof onProgress;
};
