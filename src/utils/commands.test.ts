import { CommandsDomain } from './commands';

describe('CommandsDomain', () => {
    it('should have a command for retrieving the list of domains', () => {
        expect(CommandsDomain.GetList).toBe("namecheap.domains.getList");
    });

    it('should have a command for retrieving the contact details of a domain', () => {
        expect(CommandsDomain.GetContact).toBe("namecheap.domains.getContacts");
    });

    it('should have a command for creating a new domain', () => {
        expect(CommandsDomain.Create).toBe("namecheap.domains.create");
    });

    it('should have a command for retrieving the list of TLDs', () => {
        expect(CommandsDomain.GetTldList).toBe("namecheap.domains.getTldList");
    });

    it('should have a command for setting contact information', () => {
        expect(CommandsDomain.SetContact).toBe("namecheap.domains.setContacts");
    });

    it('should have a command for checking domain availability', () => {
        expect(CommandsDomain.Check).toBe("namecheap.domains.check");
    });

    it('should have a command for reactivating an expired domain', () => {
        expect(CommandsDomain.Reactivate).toBe("namecheap.domains.reactivate");
    });

    it('should have a command for renewing a domain', () => {
        expect(CommandsDomain.Renew).toBe("namecheap.domains.renew");
    });

    it('should have a command for getting the registrar lock status', () => {
        expect(CommandsDomain.GetRegistrarLock).toBe("namecheap.domains.getRegistrarLock");
    });

    it('should have a command for setting the registrar lock status', () => {
        expect(CommandsDomain.SetRegistrarLock).toBe("namecheap.domains.setRegistrarLock");
    });

    it('should have a command for retrieving detailed domain information', () => {
        expect(CommandsDomain.GetInfo).toBe("namecheap.domains.getInfo");
    });
});