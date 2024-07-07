const prepareScanResultsArrayForPresentation = (item) => {
    const formattedItem = {};
    for (const key in item) {
      const value = item[key];
      if (value.S !== undefined) {
        formattedItem[key] = value.S;
      } else if (value.N !== undefined) {
        formattedItem[key] = Number(value.N);
      } else if (value.BOOL !== undefined) {
        formattedItem[key] = value.BOOL;
      } else if (value.L !== undefined) {
        formattedItem[key] = value.L.map(formatDynamoDBItem);
      } else if (value.M !== undefined) {
        formattedItem[key] = prepareScanResultsArrayForPresentation(value.M);
      }
    }
    // console.log(formattedItem);
    return formattedItem;
}


module.exports = {prepareScanResultsArrayForPresentation}