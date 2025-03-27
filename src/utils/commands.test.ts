// commands.test.ts
import {CommandsDomain} from './commands';

describe('CommandsDomain', () => {
    it('should have a command for retrieving the list of domains', () => {
        expect(CommandsDomain.GetList).toBe("namecheap.domains.getList");
    });

    it('should have a command for retrieving the contact details of a domain', () => {
        expect(CommandsDomain.GetContact).toBe("namecheap.domains.getContacts");
    });
});