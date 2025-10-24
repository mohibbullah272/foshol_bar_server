function calculateROI(sharePrice: number, profitPerShare: number) {
    console.log('🟢 calculateROI called with:', { sharePrice, profitPerShare });
    
    if (sharePrice <= 0) {
      throw new Error('Share price must be greater than 0');
    }
    
    const estimatedROI = (profitPerShare / sharePrice) * 100;
    const roiCalculation = `প্রতি শেয়ার মূল্য: ${sharePrice} টাকা, প্রতি শেয়ারে লাভ: ${profitPerShare} টাকা, ROI: ${estimatedROI.toFixed(2)}%`;
    

    
    return { estimatedROI, roiCalculation };
  }

  export default calculateROI