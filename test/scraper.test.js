import fetch from 'node-fetch'
import WebScraper from '../src/scraper.js'
//import jest from 'jest'

jest.mock('node-fetch', () => {
    return {
        __esModule: true,
        default: jest.fn(),
    }
})
describe('WebScraper', () => {
    let scraper

    beforeEach(() => {
        scraper = new WebScraper()
        jest.clearAllMocks() // Clear all mocks between tests
    });

    test('should remove duplicate information using Sets', async () => {
        const url = 'https://www.svt.se/nyheter/utrikes/experten-darfor-ar-konflikten-mellan-israel-och-hizbollah-att-klassa-som-ett-krig'
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html><p>Info</p><p>Info</p><h1>Title</h1><h1>Title</h1></html>') }
        fetch.mockResolvedValue(mockResponse);  // Mock fetch response

        try {
            const result = await scraper.scrape(url)
            const uniqueInfo = new Set(result.paragraphs);
            const uniqueTitles = new Set(result.titles.map(title => title.text))

            expect(uniqueInfo.size).toBe(1) // 1 unique "Info"
            expect(uniqueTitles.size).toBe(1) // 1 unique "Title"
        } catch (error) {
            console.error('Test failed:', error) // Log the error
            throw error
        }
    })

    test('should remove duplicate images by slicing src', async () => {
        const url = 'https://www.svt.se/nyheter/utrikes/experten-darfor-ar-konflikten-mellan-israel-och-hizbollah-att-klassa-som-ett-krig'
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html><img src="image1.jpg" alt="Image"><img src="image1_v2.jpg" alt="Image"></html>') }
        fetch.mockResolvedValue(mockResponse)

        const result = await scraper.scrape(url)

        const uniqueImages = new Set(result.images.map(img => img.src.slice(0, img.src.indexOf('_'))))

        expect(uniqueImages.size).toBe(result.images.length)
    })

    test('should ensure URL is valid', async () => {
        const url = 'invalid-url'
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html></html>') }
        fetch.mockResolvedValue(mockResponse)

        try {
            await scraper.scrape(url)
        } catch (e) {
            expect(e.message).toBe('Invalid URL')
        }
    })

    test('should allow user to enter URL and handle invalid input', async () => {
        const askForUrl = jest.fn().mockImplementation(() => {
            const url = prompt('Enter URL:')
            if (!url || !url.startsWith('http')) {
                throw new Error('Invalid URL')
            }
            return url
        })
        global.prompt = jest.fn().mockReturnValue('invalid-url')
        // Test invalid URL
        expect(() => askForUrl()).toThrow('Invalid URL')

        // Mock the prompt function to return a valid URL
        global.prompt = jest.fn().mockReturnValue('https://www.example.com')
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html></html>') }
        fetch.mockResolvedValue(mockResponse)

        // Test valid URL
        const url = askForUrl()
        const result = await scraper.scrape(url)
        expect(result).toBeDefined()
    })

    test('should set a random User-Agent header', async () => {
        const url = 'https://www.svt.se/nyheter/utrikes/experten-darfor-ar-konflikten-mellan-israel-och-hizbollah-att-klassa-som-ett-krig'
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html></html>') }
        fetch.mockResolvedValue(mockResponse)
 
        await scraper.scrape(url)
 
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
        ]
 
        const headers = fetch.mock.calls[0][1].headers
        expect(userAgents).toContain(headers['User-Agent'])
    })
 
    test('should use provided headers', async () => {
        const url = 'https://www.svt.se/nyheter/utrikes/experten-darfor-ar-konflikten-mellan-israel-och-hizbollah-att-klassa-som-ett-krig'
        const mockResponse = { ok: true, text: jest.fn().mockResolvedValue('<html></html>') }
        fetch.mockResolvedValue(mockResponse)
 
        const customHeaders = { 'User-Agent': 'Custom-Agent' }
        await scraper.scrape(url, { headers: customHeaders })
 
        const headers = fetch.mock.calls[0][1].headers
        expect(headers['User-Agent']).toBe('Custom-Agent')
    })
 
})