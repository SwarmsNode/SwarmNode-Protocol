import OpenAI from 'openai';
import { Agent, SwarmNodeSDK } from '../src/index';

/**
 * Advanced AI-Powered DeFi Agent with real OpenAI integration
 * This agent uses GPT-4 for market analysis and decision making
 */
export class AdvancedDeFiAgent extends Agent {
  private openai: OpenAI;
  private analysisModel: string = 'gpt-4';
  private tradingHistory: Array<{
    timestamp: number;
    pair: string;
    action: 'buy' | 'sell';
    amount: number;
    price: number;
    reasoning: string;
  }> = [];

  constructor(sdk: SwarmNodeSDK, openaiApiKey: string) {
    super(sdk, 'Advanced AI DeFi Agent', [
      'ai-analysis',
      'defi-trading',
      'risk-management',
      'market-prediction'
    ]);
    
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });
  }

  /**
   * Uses GPT-4 to analyze market data
   */
  async analyzeMarketWithAI(marketData: any): Promise<{
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    riskLevel: number;
  }> {
    const prompt = `
    Analyze the following DeFi market data and provide trading recommendations:
    
    Market Data:
    - Current Price: ${marketData.price}
    - 24h Volume: ${marketData.volume24h}
    - Price Change 24h: ${marketData.priceChange24h}%
    - RSI: ${marketData.rsi}
    - Moving Averages: MA7=${marketData.ma7}, MA30=${marketData.ma30}
    - Liquidity: ${marketData.liquidity}
    
    Please provide:
    1. Recommended action (buy/sell/hold)
    2. Confidence level (0-100)
    3. Risk assessment (0-100)
    4. Detailed reasoning
    
    Format response as JSON.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.analysisModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert DeFi trading analyst. Provide objective, data-driven trading recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        action: analysis.action,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        riskLevel: analysis.riskLevel
      };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Fallback to simple technical analysis
      return this.fallbackAnalysis(marketData);
    }
  }

  /**
   * Executes an AI-based trading strategy
   */
  async executeAIStrategy(pair: string): Promise<boolean> {
    try {
      // Market data collection
      const marketData = await this.fetchMarketData(pair);
      
      // AI Analysis
      const aiAnalysis = await this.analyzeMarketWithAI(marketData);
      
      // Security conditions check
      if (aiAnalysis.confidence < 70 || aiAnalysis.riskLevel > 80) {
        console.log(`Skipping trade for ${pair}: Low confidence or high risk`);
        return false;
      }

      // Trade execution
      if (aiAnalysis.action === 'buy' || aiAnalysis.action === 'sell') {
        const success = await this.executeTrade(
          pair,
          aiAnalysis.action,
          this.calculateTradeAmount(aiAnalysis.confidence, aiAnalysis.riskLevel)
        );

        if (success) {
          // Enregistrement dans l'historique
          this.tradingHistory.push({
            timestamp: Date.now(),
            pair,
            action: aiAnalysis.action,
            amount: this.calculateTradeAmount(aiAnalysis.confidence, aiAnalysis.riskLevel),
            price: marketData.price,
            reasoning: aiAnalysis.reasoning
          });

          // Report to blockchain
          await this.reportTradeToBlockchain(pair, aiAnalysis);
        }

        return success;
      }

      return true;
    } catch (error) {
      console.error(`AI Strategy execution failed for ${pair}:`, error);
      return false;
    }
  }

  /**
   * Analyse technique de fallback
   */
  private fallbackAnalysis(marketData: any) {
    const rsi = marketData.rsi;
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 50;

    if (rsi < 30) {
      action = 'buy';
      confidence = 70;
    } else if (rsi > 70) {
      action = 'sell';
      confidence = 70;
    }

    return {
      action,
      confidence,
      reasoning: `Technical analysis: RSI=${rsi}`,
      riskLevel: Math.abs(50 - rsi)
    };
  }

  /**
   * Calculate trade amount based on confidence and risk
   */
  private calculateTradeAmount(confidence: number, riskLevel: number): number {
    const baseAmount = 100; // Base amount in tokens
    const confidenceMultiplier = confidence / 100;
    const riskMultiplier = Math.max(0.1, (100 - riskLevel) / 100);
    
    return baseAmount * confidenceMultiplier * riskMultiplier;
  }

  /**
   * Report trades to blockchain
   */
  private async reportTradeToBlockchain(pair: string, analysis: any): Promise<void> {
    try {
      await this.sdk.reportAgentActivity({
        agentId: this.id,
        activityType: 'ai_trade_execution',
        data: {
          pair,
          analysis: analysis.reasoning,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to report to blockchain:', error);
    }
  }

  /**
   * Get agent performance metrics
   */
  getPerformanceMetrics() {
    const totalTrades = this.tradingHistory.length;
    const profitableTrades = this.tradingHistory.filter(trade => {
      // Simplified logic to calculate profitability
      return trade.action === 'buy' ? true : false; // To be implemented correctly
    }).length;

    return {
      totalTrades,
      profitableTrades,
      winRate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
      avgConfidence: this.tradingHistory.reduce((sum, trade) => sum + 75, 0) / totalTrades || 0, // Simplified
      lastTradeTimestamp: this.tradingHistory[this.tradingHistory.length - 1]?.timestamp || 0
    };
  }
}
