import { StaticPortfolioRepository } from '@/data/repositories/static-portfolio-repository';
import type { PortfolioRepository } from '@/domain/repositories/portfolio-repository';

/**
 * Composition root. The only file that knows which repository
 * implementation the site uses. Pages import from here; components
 * receive plain domain entities as props.
 */
export const portfolioRepository: PortfolioRepository = new StaticPortfolioRepository();
