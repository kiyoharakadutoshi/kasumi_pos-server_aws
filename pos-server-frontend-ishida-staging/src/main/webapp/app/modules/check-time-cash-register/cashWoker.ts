// Define the structure of a cash register item
type CashRegisterItem = {
  cash_register_code: string | null;
};

// Define the type for the input data sent to the worker
type WorkerInputData = CashRegisterItem[];

// Define the type for the output data sent from the worker
type WorkerOutputData = {
  calcTotalPage: number;
  formatArr: { [key: number]: CashRegisterItem[] };
  arrNull: CashRegisterItem[];
};

// Define the type for the formatted array
type Arr = { [key: number]: CashRegisterItem[] };

// Define the worker function
const workerFunction = function (this: Worker): void {
  // Handle messages received by the worker
  this.onmessage = (event: MessageEvent<WorkerInputData>): void => {
    const arr: WorkerInputData = event.data;
    const CHUNK = 3; // Define the chunk size
    const totalRecord: number = arr.length; // Get the total number of records
    const calcTotalPage: number = Math.ceil(totalRecord / CHUNK); // Calculate the total number of pages
    const arrNull: CashRegisterItem[] = []; // Array to store items with null cash_register_code
    const arrNotNull: CashRegisterItem[] = []; // Array to store items with non-null cash_register_code

    // Separate items into arrNull and arrNotNull based on cash_register_code
    arr.forEach((item: CashRegisterItem): void => {
      if (item.cash_register_code === null) {
        arrNull.push(item);
      } else {
        arrNotNull.push(item);
      }
    });

    // If there are items with null cash_register_code, add the first one to arrNotNull
    if (arrNull.length > 0) {
      arrNotNull.push(arrNull[0]);
    }

    // Format arrNotNull into chunks and store in formatArr
    const formatArr: Arr = arrNotNull.reduce(
      (obj: Arr, _: CashRegisterItem, index: number): Arr => {
        if (index % CHUNK === 0) {
          obj[index / CHUNK + 1] = arrNotNull.slice(index, index + CHUNK);
        }
        return obj;
      },
      {} as { [key: number]: CashRegisterItem[] }
    );

    // Post the result back to the main thread
    postMessage({ calcTotalPage, formatArr } as WorkerOutputData);
  };
};

// Convert the worker function to a string
const codeToString: string = workerFunction.toString();
// Extract the main code from the function string
const mainCode: string = codeToString.substring(codeToString.indexOf('{') + 1, codeToString.lastIndexOf('}'));
// Create a Blob from the main code
const blob = new Blob([mainCode], { type: 'application/javascript' });
// Create a URL for the Blob
const worker_script: string = URL.createObjectURL(blob);

// Export the worker script URL
export default worker_script;
