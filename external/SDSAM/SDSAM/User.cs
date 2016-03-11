using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SDSAM
{
    public class User
    {
        public string DistinguishedName { get; set; }
        public string Name { get; set; }

        public override string ToString()
        {
            return this.Name;
        }

        public virtual List<Group> Groups { get; set; }
    }
}
